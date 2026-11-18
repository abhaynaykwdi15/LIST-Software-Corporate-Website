import { z } from 'zod'

const resumeSchema = z.unknown()
  .refine((files) => files && typeof files === 'object' && files.length === 1, {
    error: 'Please attach your resume.',
  })
  .transform((files) => files[0])
  .refine((file) => /\.(pdf|doc|docx)$/i.test(file?.name || ''), {
    error: 'Resume must be a PDF, DOC or DOCX file.',
  })
  .refine((file) => file.size > 0 && file.size <= 10 * 1024 * 1024, {
    error: 'Resume must be between 1 byte and 10 MB.',
  })

export const applicationSchema = z.object({
  full_name: z.string()
    .trim()
    .min(2, { error: 'Enter your full name.' })
    .max(160, { error: 'Full name must be 160 characters or fewer.' }),
  email: z.email({ error: 'Enter a valid email address.' }),
  phone: z.string()
    .trim()
    .min(7, { error: 'Enter a valid phone number.' })
    .max(30, { error: 'Phone number must be 30 characters or fewer.' })
    .refine((value) => {
      const digits = value.replace(/\D/g, '')
      return digits.length >= 7 && digits.length <= 15
    }, { error: 'Phone number must contain 7 to 15 digits.' }),
  qualification: z.string()
    .trim()
    .min(2, { error: 'Enter your highest qualification.' })
    .max(200, { error: 'Qualification must be 200 characters or fewer.' }),
  experience: z.string()
    .trim()
    .min(1, { error: 'Enter your years of experience.' })
    .max(100, { error: 'Experience must be 100 characters or fewer.' }),
  current_location: z.string()
    .trim()
    .min(2, { error: 'Enter your current location.' })
    .max(160, { error: 'Location must be 160 characters or fewer.' }),
  skills: z.string()
    .trim()
    .min(2, { error: 'Add at least one relevant skill.' })
    .max(3000, { error: 'Skills must be 3,000 characters or fewer.' }),
  cover_letter: z.string()
    .max(5000, { error: 'Cover letter must be 5,000 characters or fewer.' }),
  job_id: z.string()
    .regex(/^\d+$/, { error: 'Choose a valid job profile.' }),
  resume: resumeSchema,
  consent_given: z.boolean()
    .refine((value) => value, { error: 'Consent is required to submit an application.' }),
})
