"""
Simple Activity Tracker
Tracks mouse and keyboard activity and provides 10-second summaries
"""

import time
import sys
import io
from contextlib import redirect_stderr
from datetime import datetime
from threading import Thread, Lock
from pynput import mouse, keyboard
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
try:
    import pyautogui
    PYAutoGUI_AVAILABLE = True
except ImportError:
    PYAutoGUI_AVAILABLE = False

# Create a filtered stderr writer to suppress pynput errors
class FilteredStderr:
    def __init__(self, original_stderr):
        self.original_stderr = original_stderr
        self.buffer = ""
        self.suppress_next = False
    
    def write(self, s):
        self.buffer += s
        # Check if this is a pynput error we want to suppress
        if (
            "Unhandled exception in listener callback" in self.buffer
            or "_thread._ThreadHandle" in self.buffer
            or "'_thread._ThreadHandle' object is not callable" in self.buffer
        ):
            # Suppress the whole traceback block related to this error
            self.suppress_next = True
        
        # If we have a complete line, process it
        if "\n" in self.buffer:
            lines = self.buffer.split("\n")
            for line in lines[:-1]:
                # Suppress pynput-related errors
                if not (
                    self.suppress_next
                    or "_thread._ThreadHandle" in line
                    or "'_thread._ThreadHandle' object is not callable" in line
                    or (
                        "pynput" in line.lower()
                        and (
                            "NotImplementedError" in line
                            or "TypeError" in line
                            or "_ThreadHandle" in line
                            or "Traceback" in line
                        )
                    )
                ):
                    self.original_stderr.write(line + "\n")
                # Reset suppress flag after processing a traceback block
                if line.strip() == "" and self.suppress_next:
                    self.suppress_next = False
            self.buffer = lines[-1]
    
    def flush(self):
        if self.buffer and not self.suppress_next:
            if not (
                "_thread._ThreadHandle" in self.buffer
                or "'_thread._ThreadHandle' object is not callable" in self.buffer
                or (
                    "pynput" in self.buffer.lower()
                    and (
                        "NotImplementedError" in self.buffer
                        or "TypeError" in self.buffer
                    )
                )
            ):
                self.original_stderr.write(self.buffer)
        self.original_stderr.flush()
        self.buffer = ""
        self.suppress_next = False

# Store original stderr
_original_stderr = sys.stderr

class ActivityTracker:
    def __init__(self, interval_seconds=10):
        self.interval_seconds = interval_seconds
        
        # Activity tracking variables
        self.mouse_events = 0
        self.keyboard_events = 0
        self.start_time = None
        self.last_activity_time = None
        self.is_active = False
        
        # Track active seconds (set of second timestamps) for the current window
        self.active_seconds = set()
        # Track all active seconds for the whole session (deterministic second buckets)
        self.global_active_seconds = set()
        # Optional raw counts per second for analytics: {second_ts: {"mouse": int, "keyboard": int}}
        self.per_second_counts = {}
        # Aggregated active seconds per minute bucket: {minute_index: int}
        self.per_minute_active_seconds = {}
        
        # Thread safety
        self.lock = Lock()
        
        # Listeners
        self.mouse_listener = None
        self.keyboard_listener = None
        
        # Mouse polling (for Windows compatibility)
        self.last_mouse_pos = None
        self.mouse_polling_thread = None
        self.polling_active = False
        
        # Facecam
        self.camera_active = False
        self.camera_thread = None
    
    def _mark_second_active(self, second_ts: int) -> None:
        """
        Mark a given second as active in both the current window and session-level
        aggregates. Multiple events within the same second are collapsed into one.
        """
        # For current reporting window
        self.active_seconds.add(second_ts)
        # For whole session
        if second_ts not in self.global_active_seconds:
            self.global_active_seconds.add(second_ts)
            # Increment the corresponding minute bucket once per active second
            minute_index = second_ts // 60
            current = self.per_minute_active_seconds.get(minute_index, 0)
            self.per_minute_active_seconds[minute_index] = current + 1
        
    def on_mouse_move(self, x, y):
        """Track mouse movement - called on every mouse movement"""
        try:
            current_time = time.time()
            current_second = int(current_time)
            # Use lock for thread safety
            with self.lock:
                self.mouse_events += 1
                # Update raw per-second counts for analytics
                bucket = self.per_second_counts.get(current_second)
                if bucket is None:
                    bucket = {"mouse": 0, "keyboard": 0}
                    self.per_second_counts[current_second] = bucket
                bucket["mouse"] += 1
                # Mark the current second as active (using integer timestamp)
                self._mark_second_active(current_second)
                self.last_activity_time = current_time
                self.is_active = True
        except Exception:
            pass  # Silently ignore errors
    
    def on_mouse_click(self, x, y, button, pressed):
        """Track mouse clicks - both press and release"""
        try:
            # Track both press and release as activity
            current_time = time.time()
            current_second = int(current_time)
            with self.lock:
                self.mouse_events += 1
                # Update raw per-second counts for analytics
                bucket = self.per_second_counts.get(current_second)
                if bucket is None:
                    bucket = {"mouse": 0, "keyboard": 0}
                    self.per_second_counts[current_second] = bucket
                bucket["mouse"] += 1
                # Mark the current second as active (using integer timestamp)
                self._mark_second_active(current_second)
                self.last_activity_time = current_time
                self.is_active = True
        except Exception:
            pass  # Silently ignore errors
    
    def poll_mouse_position(self):
        """Poll mouse position to detect movement (Windows compatibility)"""
        mouse_controller = mouse.Controller()
        while self.polling_active:
            try:
                # Get current mouse position using pynput
                current_pos = mouse_controller.position
                
                with self.lock:
                    if self.last_mouse_pos is None:
                        self.last_mouse_pos = current_pos
                    elif self.last_mouse_pos != current_pos:
                        # Mouse moved!
                        self.mouse_events += 1
                        current_time = time.time()
                        current_second = int(current_time)
                        # Update raw per-second counts for analytics
                        bucket = self.per_second_counts.get(current_second)
                        if bucket is None:
                            bucket = {"mouse": 0, "keyboard": 0}
                            self.per_second_counts[current_second] = bucket
                        bucket["mouse"] += 1
                        self._mark_second_active(current_second)
                        self.last_activity_time = current_time
                        self.is_active = True
                        self.last_mouse_pos = current_pos
                
                time.sleep(0.1)  # Check every 100ms
            except Exception:
                time.sleep(0.1)
    
    def on_key_press(self, key):
        """Track keyboard presses"""
        try:
            with self.lock:
                self.keyboard_events += 1
                current_time = time.time()
                # Mark the current second as active (using integer timestamp)
                current_second = int(current_time)
                # Update raw per-second counts for analytics
                bucket = self.per_second_counts.get(current_second)
                if bucket is None:
                    bucket = {"mouse": 0, "keyboard": 0}
                    self.per_second_counts[current_second] = bucket
                bucket["keyboard"] += 1
                self._mark_second_active(current_second)
                self.last_activity_time = current_time
                self.is_active = True
        except Exception:
            pass  # Silently ignore errors
    
    def capture_facecam(self):
        """Capture and display facecam video while tracking is running."""
        if not OPENCV_AVAILABLE:
            print("Facecam: OpenCV (cv2) is not available, skipping camera.")
            return
        
        cap = None
        try:
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                print("Facecam: Unable to access the default camera.")
                return
            
            cv2.namedWindow("Facecam", cv2.WINDOW_NORMAL)
            self.camera_active = True
            
            while self.camera_active:
                ret, frame = cap.read()
                if not ret:
                    print("Facecam: Failed to read frame from camera.")
                    break
                
                cv2.imshow("Facecam", frame)
                # Press 'q' while the Facecam window is focused to close it
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    self.camera_active = False
                    break
        except Exception as e:
            print(f"Facecam: Error occurred ({e})")
        finally:
            if cap is not None:
                cap.release()
            try:
                cv2.destroyWindow("Facecam")
            except Exception:
                try:
                    cv2.destroyAllWindows()
                except Exception:
                    pass
    
    def calculate_activity_percentage(self, active_seconds, window_seconds):
        """
        Calculate activity percentage for a fixed-size window in seconds.
        For per-minute summaries, window_seconds should be 60.
        """
        if window_seconds <= 0:
            return 0.0
        return (active_seconds / window_seconds) * 100.0
    
    def get_minute_summary(self, minute_index: int):
        """
        Get a deterministic per-minute summary bucket.
        
        minute_index is the integer division of a unix second by 60
        (i.e. minute_index = second_ts // 60).
        """
        with self.lock:
            active_seconds = self.per_minute_active_seconds.get(minute_index, 0)
            window_seconds = 60
            percentage = self.calculate_activity_percentage(active_seconds, window_seconds)
            minute_start_ts = minute_index * 60
            return {
                "minute_index": minute_index,
                "minute_start_epoch": minute_start_ts,
                "active_seconds": active_seconds,
                "activity_percentage": percentage,
                "window_seconds": window_seconds,
            }
    
    def get_overall_summary(self, session_start_ts: float, session_end_ts: float):
        """
        Overall summary across an arbitrary session window.
        Uses second-level buckets and is safe for long durations.
        """
        with self.lock:
            start_second = int(session_start_ts)
            end_second = int(session_end_ts)
            if end_second < start_second:
                end_second = start_second
            total_seconds = (end_second - start_second) + 1
            
            active_seconds = 0
            for sec in range(start_second, end_second + 1):
                if sec in self.global_active_seconds:
                    active_seconds += 1
            
            percentage = self.calculate_activity_percentage(active_seconds, total_seconds)
            return {
                "session_start_epoch": start_second,
                "session_end_epoch": end_second,
                "total_seconds": total_seconds,
                "active_seconds": active_seconds,
                "activity_percentage": percentage,
            }
    
    def generate_summary(self, session_start, session_end):
        """Generate and print activity summary for the last interval."""
        with self.lock:
            # Fix the reporting window to the configured interval size (e.g. 10s)
            # regardless of small timing jitter, so percentages are always
            # based on exactly `self.interval_seconds` seconds.
            session_start_second = int(session_start)
            window_seconds = int(self.interval_seconds)
            session_end_second = session_start_second + window_seconds - 1
            
            # Count how many seconds in the session had activity
            active_seconds_count = 0
            for second in range(session_start_second, session_end_second + 1):
                if second in self.active_seconds:
                    active_seconds_count += 1
            
            # Active time is the number of active seconds in this window
            active_time = active_seconds_count
            
            # Calculate activity percentage for this fixed-size window
            activity_percentage = self.calculate_activity_percentage(
                active_time,
                window_seconds,
            )
            
            print("\n" + "="*60)
            print(f"ACTIVITY SUMMARY - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("="*60)
            print(f"Time Period: {self.interval_seconds} seconds")
            print(f"Total Time: {window_seconds} seconds")
            print(f"Active Seconds: {active_seconds_count} seconds")
            print(f"Activity Percentage: {activity_percentage:.2f}%")
            print(f"Mouse Events: {self.mouse_events}")
            print(f"Keyboard Events: {self.keyboard_events}")
            print(f"Total Events: {self.mouse_events + self.keyboard_events}")
            print("="*60 + "\n")
            
            # Reset counters and active seconds for next interval
            self.mouse_events = 0
            self.keyboard_events = 0
            self.active_seconds.clear()
    
    def start_tracking(self):
        """Start tracking mouse and keyboard activity"""
        print(f"Starting activity tracker...")
        print(f"Summary will be generated every {self.interval_seconds} seconds")
        print("Press Ctrl+C to stop tracking\n")
        
        # Filter stderr to suppress pynput internal errors
        sys.stderr = FilteredStderr(_original_stderr)
        
        # Start mouse tracking using both listener and polling
        mouse_tracking_active = False
        
        # Try event-based listener first
        try:
            self.mouse_listener = mouse.Listener(
                on_move=self.on_mouse_move,
                on_click=self.on_mouse_click,
                suppress=False
            )
            self.mouse_listener.start()
            time.sleep(0.3)
            if hasattr(self.mouse_listener, 'running') and self.mouse_listener.running:
                mouse_tracking_active = True
                print("Mouse tracking (listener): Active")
        except Exception as e:
            print(f"Mouse tracking (listener): Failed ({str(e)})")
            self.mouse_listener = None
        
        # Also start polling method for better Windows compatibility
        try:
            self.polling_active = True
            self.mouse_polling_thread = Thread(target=self.poll_mouse_position, daemon=True)
            self.mouse_polling_thread.start()
            if not mouse_tracking_active:
                print("Mouse tracking (polling): Active")
            else:
                print("Mouse tracking (polling): Active (backup method)")
        except Exception as e:
            print(f"Mouse tracking (polling): Failed ({str(e)})")
            self.polling_active = False
        
        # Start keyboard listener with error suppression
        try:
            self.keyboard_listener = keyboard.Listener(
                on_press=self.on_key_press,
                suppress=False
            )
            self.keyboard_listener.start()
            print("Keyboard tracking: Active")
        except Exception as e:
            print(f"Keyboard tracking: Failed to start ({str(e)})")
            print("Note: Keyboard tracking may require administrator privileges on Windows")
            self.keyboard_listener = None
        
        # Start facecam in a background thread
        if OPENCV_AVAILABLE:
            try:
                self.camera_active = True
                self.camera_thread = Thread(target=self.capture_facecam, daemon=True)
                self.camera_thread.start()
                print("Facecam: Active (window 'Facecam')")
            except Exception as e:
                self.camera_active = False
                print(f"Facecam: Failed to start ({e})")
        else:
            print("Facecam: OpenCV (cv2) not installed, skipping camera.")
        
        # Keep filtered stderr active to suppress ongoing pynput errors
        
        print()  # Empty line for readability
        
        # Main tracking loop
        try:
            while True:
                self.start_time = time.time()
                time.sleep(self.interval_seconds)
                session_end = time.time()
                self.generate_summary(self.start_time, session_end)
        except KeyboardInterrupt:
            print("\n\nStopping activity tracker...")
            self.stop_tracking()
    
    def stop_tracking(self):
        """Stop tracking and cleanup"""
        # Stop polling
        self.polling_active = False
        if self.mouse_polling_thread:
            self.mouse_polling_thread.join(timeout=1.0)
        
        # Stop facecam
        self.camera_active = False
        if self.camera_thread and self.camera_thread.is_alive():
            self.camera_thread.join(timeout=1.0)
        
        try:
            if self.mouse_listener:
                self.mouse_listener.stop()
        except Exception:
            pass
        try:
            if self.keyboard_listener:
                self.keyboard_listener.stop()
        except Exception:
            pass
        # Restore original stderr
        sys.stderr = _original_stderr
        print("Activity tracker stopped.")

def main():
    """Main function to run the activity tracker"""
    tracker = ActivityTracker(interval_seconds=10)
    tracker.start_tracking()

if __name__ == "__main__":
    main()

