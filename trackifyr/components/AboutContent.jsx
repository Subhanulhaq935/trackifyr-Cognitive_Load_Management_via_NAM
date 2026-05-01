/**
 * @fileoverview Reusable About page sections: overview, team, how-to, definitions.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

const TEAM = [
  {
    image: 'moin.jpg',
    name: 'Muhammad Moin U Din',
    id: 'BCSF22M023',
    email: 'bcsf22m023@pucit.edu.pk',
  },
  {
    image: 'Junaid.jpg',
    name: 'Muhammad Junaid Malik',
    id: 'BCSF22M031',
    email: 'bcsf22m031@pucit.edu.pk',
  },
  {
    image: 'Subhan.jpg',
    name: 'Muhammad Subhan Ul Haq',
    id: 'BCSF22M043',
    email: 'bcsf22m043@pucit.edu.pk',
  },
]

const HOW_TO_STEPS = [
  <>
    <span className="font-semibold text-gray-900 dark:text-slate-100">Sign up or sign in</span> with your account.
  </>,
  <div className="flex flex-col items-start gap-3">
    <p>
      <span className="font-semibold text-gray-900 dark:text-slate-100">Download the desktop app</span> from the trackifyr download page,
      then install it on your Windows PC.
    </p>
    <Link
      href="/download?from=about"
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
    >
      <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        />
      </svg>
      Desktop app
    </Link>
  </div>,
  <>
    <span className="font-semibold text-gray-900 dark:text-slate-100">Start a monitoring session</span> from the desktop app (timer or
    session) when you want tracking to run.
  </>,
  <>
    <span className="font-semibold text-gray-900 dark:text-slate-100">Enable the webcam if you want.</span> It is optional: activity can
    still be tracked without it.
  </>,
  <>
    <span className="font-semibold text-gray-900 dark:text-slate-100">Let the system observe activity</span> while you use your computer
    normally during the session.
  </>,
  <>
    <span className="font-semibold text-gray-900 dark:text-slate-100">Open the dashboard</span> to see analytics, trends, and session history
    when you are done or while you work.
  </>,
]

function TeamAvatar({ image, name }) {
  const [useFallback, setUseFallback] = useState(false)
  const initial = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[148px] overflow-hidden rounded-2xl shadow-md ring-2 ring-white dark:ring-slate-600">
      {!useFallback ? (
        <img
          src={`/artifacts/${image}`}
          alt={name}
          className="h-full w-full object-cover object-top"
          loading="lazy"
          onError={() => setUseFallback(true)}
        />
      ) : (
        <div
          className="flex h-full min-h-[148px] w-full items-center justify-center bg-gradient-to-br from-indigo-600 to-blue-600 text-lg font-bold text-white sm:text-xl"
          aria-hidden
        >
          {initial}
        </div>
      )}
    </div>
  )
}

function SectionShell({ eyebrow, title, children, variant = 'default' }) {
  const isHero = variant === 'hero'
  return (
    <section
      className={
        isHero
          ? 'overflow-hidden rounded-3xl border border-indigo-100/80 bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/50 p-6 shadow-md shadow-indigo-900/5 dark:border-slate-700 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950 sm:p-9'
          : 'rounded-2xl border border-gray-100/90 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900/90 sm:p-8'
      }
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">{eyebrow}</p>
      )}
      <h2 className={`font-bold text-gray-900 dark:text-slate-100 ${eyebrow ? 'mt-2' : ''} ${isHero ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
        {title}
      </h2>
      {isHero && <div className="mt-3 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500" aria-hidden />}
      <div className={isHero ? 'mt-6' : 'mt-5'}>{children}</div>
    </section>
  )
}

export default function AboutContent({ showPublicFooter = false }) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <SectionShell variant="hero" title="What is trackifyr?">
        <div className="space-y-4 text-sm leading-relaxed text-gray-600 dark:text-slate-400 sm:text-base">
          <p>
            trackifyr helps you understand your <strong className="font-semibold text-gray-800 dark:text-slate-200">cognitive load</strong>{' '}
            and supports <strong className="font-semibold text-gray-800 dark:text-slate-200">digital wellbeing</strong> while you work or
            study. Instead of guessing how drained or distracted you feel, the system gives you a simple, ongoing picture
            you can use to pace breaks, focus blocks, and screen time.
          </p>
          <p>
            It works as a <strong className="font-semibold text-gray-800 dark:text-slate-200">multimodal</strong> companion: optional
            webcam-based cues for attention and engagement, together with{' '}
            <strong className="font-semibold text-gray-800 dark:text-slate-200">activity tracking</strong> (keyboard and mouse) from a session
            you start when you are ready. Nothing replaces your judgment. It adds gentle, aggregated feedback you can
            review on the dashboard.
          </p>
          <p>
            <strong className="font-semibold text-gray-800 dark:text-slate-200">Use cases</strong> include planning deep work, staying aware
            during long online learning sessions, checking engagement during presentations or remote collaboration, and
            building healthier habits around intensity and rest.
          </p>
        </div>
      </SectionShell>

      <SectionShell eyebrow="People" title="Team and supervisor">
        <div className="mb-8 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/95 to-white p-5 dark:border-slate-700 dark:from-indigo-950/40 dark:to-slate-900 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Supervisor</p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-slate-100 sm:text-xl">Dr. Tayyaba Tariq</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-400 sm:mt-0 sm:max-w-lg sm:text-right">
            Academic guidance for this Final Year Project on cognitive load estimation and natural activity monitoring.
          </p>
        </div>

        <p className="text-sm font-medium text-gray-500 dark:text-slate-500">Student authors</p>
        <ul className="mt-6 grid gap-5 sm:grid-cols-3">
          {TEAM.map((m) => (
            <li
              key={m.image}
              className="group flex flex-col items-center rounded-2xl border border-gray-100 bg-gradient-to-b from-slate-50/90 to-white p-5 text-center shadow-sm ring-1 ring-gray-100/80 transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200/80 hover:shadow-lg hover:shadow-indigo-900/5 dark:border-slate-700 dark:from-slate-800/80 dark:to-slate-900 dark:ring-slate-700 dark:hover:border-indigo-500/40"
            >
              <TeamAvatar image={m.image} name={m.name} />
              <p className="mt-4 text-sm font-semibold text-gray-900 dark:text-slate-100">{m.name}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">{m.id}</p>
              <a
                href={`mailto:${m.email}`}
                className="mt-2 max-w-full break-all text-xs font-medium text-indigo-600 underline-offset-2 transition hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {m.email}
              </a>
            </li>
          ))}
        </ul>
      </SectionShell>

      <SectionShell eyebrow="Guide" title="How to use">
        <ol className="mt-1 space-y-3">
          {HOW_TO_STEPS.map((content, i) => (
            <li key={i} className="flex gap-4 rounded-xl border border-transparent bg-gray-50/60 px-3 py-3 dark:bg-slate-800/50 sm:px-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 shadow-sm dark:bg-indigo-950/60 dark:text-indigo-300"
                aria-hidden
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 pt-1 text-sm leading-relaxed text-gray-700 dark:text-slate-300 sm:text-base">{content}</div>
            </li>
          ))}
        </ol>
      </SectionShell>

      <SectionShell eyebrow="Glossary" title="Key terms">
        <div className="mt-1 grid gap-4 sm:gap-5">
          <div className="rounded-xl border-l-4 border-indigo-500 bg-gray-50/70 px-4 py-4 dark:bg-slate-800/70 sm:px-5">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Activity load</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              Based on keyboard and mouse usage over time. Shown as a percentage from 0 to 100. A higher value means more
              interaction; a lower value usually means you have been more idle. It is a simple signal of how busy your
              hands and cursor have been, not a judgment of quality of work.
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-indigo-500 bg-gray-50/70 px-4 py-4 dark:bg-slate-800/70 sm:px-5">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Engagement</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              Based on webcam-related signals when the camera path is enabled. You will see it as{' '}
              <strong className="text-gray-800 dark:text-slate-200">Low</strong>, <strong className="text-gray-800 dark:text-slate-200">Medium</strong>, or{' '}
              <strong className="text-gray-800 dark:text-slate-200">High</strong>. It reflects things like face presence and gaze-style cues
              combined into one easy level: a snapshot of how present you appear toward the screen, not a personality score.
            </p>
          </div>
          <div className="rounded-xl border-l-4 border-indigo-500 bg-gray-50/70 px-4 py-4 dark:bg-slate-800/70 sm:px-5">
            <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">Cognitive load</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-slate-400">
              The overall picture the app shows you: it combines activity and engagement (when available) into{' '}
              <strong className="text-gray-800 dark:text-slate-200">Low</strong>, <strong className="text-gray-800 dark:text-slate-200">Medium</strong>, or{' '}
              <strong className="text-gray-800 dark:text-slate-200">High</strong> cognitive load. Use it to notice heavy stretches, compare
              days, and decide when to slow down or take a break.
            </p>
          </div>
        </div>
      </SectionShell>

      {showPublicFooter && (
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white/80 py-5 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <Link href="/signin" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </Link>
          <span className="text-gray-300 dark:text-slate-600" aria-hidden>
            ·
          </span>
          <Link href="/signup" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Sign up
          </Link>
          <span className="text-gray-300 dark:text-slate-600" aria-hidden>
            ·
          </span>
          <Link href="/download?from=signin" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Desktop app
          </Link>
        </div>
      )}
    </div>
  )
}
