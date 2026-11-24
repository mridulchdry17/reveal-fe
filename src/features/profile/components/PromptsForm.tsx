import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import type { MyProfile, ProfileOptions, PromptsUpdate } from '../api/profile'
import { profileErrorMessage } from '../utils/errorMessage'
import { stepPath } from '../utils/steps'
import { StepLayout } from './StepLayout'

type Props = {
  profile: MyProfile
  options: ProfileOptions
  onSave: (values: PromptsUpdate) => void
  saving: boolean
  error: unknown
}

const OWN = '__own__'

export function PromptsForm({ profile, options, onSave, saving, error }: Props) {
  const initial = [0, 1, 2].map(
    (i) => profile.prompts[i] ?? { question: options.prompt_questions[i] ?? '', answer: '' },
  )
  const { register, handleSubmit, setValue, control } = useForm<PromptsUpdate>({
    defaultValues: {
      prompts: initial.map(({ question, answer }) => ({ question, answer })),
    },
  })
  const [ownQuestion, setOwnQuestion] = useState(
    initial.map((p) => !options.prompt_questions.includes(p.question)),
  )
  const [hint, setHint] = useState<string | null>(null)
  const prompts = useWatch({ control, name: 'prompts' })

  const submit = handleSubmit((values) => {
    const cleaned = values.prompts.map((p) => ({
      question: p.question.trim(),
      answer: p.answer.trim(),
    }))
    if (cleaned.some((p) => p.question.length < 3))
      return setHint('Pick or write a question for each prompt.')
    if (cleaned.some((p) => p.answer.length < 2)) return setHint('Answer all three prompts.')
    if (new Set(cleaned.map((p) => p.question.toLowerCase())).size < 3) {
      return setHint('Pick three different prompts.')
    }
    setHint(null)
    onSave({ prompts: cleaned })
  })

  return (
    <form onSubmit={submit} noValidate>
      <StepLayout
        step={2}
        backTo={stepPath('basics')}
        title="Answer 3"
        accent="prompts"
        subtitle="This is what people fall for first. Be specific, be a little weird. Names, numbers and handles are blocked."
        submitLabel="Next"
        submitting={saving}
        error={hint ?? (error ? profileErrorMessage(error) : null)}
      >
        {prompts.map((prompt, i) => {
          const taken = prompts.filter((_, j) => j !== i).map((p) => p.question)
          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[24px] border-[1.5px] border-border bg-surface p-4 shadow-[0_10px_24px_rgb(40_20_10/0.06)] focus-within:border-accent"
            >
              <label htmlFor={`question-${i}`} className="sr-only">
                Prompt {i + 1}
              </label>
              <select
                id={`question-${i}`}
                value={ownQuestion[i] ? OWN : prompt.question}
                onChange={(event) => {
                  const own = event.target.value === OWN
                  setOwnQuestion((all) => all.map((v, j) => (j === i ? own : v)))
                  setValue(`prompts.${i}.question`, own ? '' : event.target.value)
                }}
                className="h-11 rounded-full border-[1.5px] border-field bg-surface-2 px-3 text-[13px] font-bold text-text"
              >
                {options.prompt_questions.map((q) => (
                  <option key={q} value={q} disabled={taken.includes(q)}>
                    {q}
                  </option>
                ))}
                <option value={OWN}>Write my own…</option>
              </select>
              {ownQuestion[i] && (
                <>
                  <label htmlFor={`own-${i}`} className="sr-only">
                    Your own prompt {i + 1}
                  </label>
                  <input
                    id={`own-${i}`}
                    maxLength={60}
                    placeholder="Your own prompt"
                    {...register(`prompts.${i}.question`)}
                    className="h-11 rounded-full border-[1.5px] border-field bg-surface px-4 text-sm text-text"
                  />
                </>
              )}
              <label htmlFor={`answer-${i}`} className="sr-only">
                Your answer to prompt {i + 1}
              </label>
              <div className="flex gap-1.5">
                <span aria-hidden="true" className="font-display text-[34px] leading-[0.9] text-accent-text">
                  “
                </span>
                <textarea
                  id={`answer-${i}`}
                  rows={2}
                  maxLength={options.prompt_answer_max}
                  placeholder="Your answer"
                  {...register(`prompts.${i}.answer`)}
                  className="min-w-0 flex-1 resize-none border-0 bg-transparent p-0 pt-1 font-display text-[24px] leading-[1.15] font-normal text-text italic placeholder:text-muted focus:outline-none"
                />
              </div>
              <span className="self-end text-xs text-muted">
                {prompt.answer.length} / {options.prompt_answer_max}
              </span>
            </div>
          )
        })}
        <p className="m-0 text-[13px] text-muted">
          People can like one answer and say why. A good line beats a good angle.
        </p>
      </StepLayout>
    </form>
  )
}
