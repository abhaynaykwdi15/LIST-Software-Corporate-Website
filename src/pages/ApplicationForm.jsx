import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowRight, ArrowUpRight, Check, CircleCheck, FileText, LockKeyhole, ShieldCheck } from 'lucide-react'
import FieldError from '../components/FieldError'
import PageIntro from '../components/PageIntro'
import { api, getErrorMessage } from '../services/api'
import { listingStatus, listingStatusText } from '../services/jobListings'
import { applicationSchema } from '../schemas/applicationSchema'

const initialApplication = {
  full_name: '',
  email: '',
  phone: '',
  qualification: '',
  experience: '',
  current_location: '',
  skills: '',
  cover_letter: '',
  job_id: '',
  consent_given: false,
}

export default function ApplicationForm() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [jobs, setJobs] = useState([])
  const [jobError, setJobError] = useState('')
  const [jobsError, setJobsError] = useState('')
  const [success, setSuccess] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(applicationSchema),
    defaultValues: { ...initialApplication, job_id: String(jobId) },
  })

  useEffect(() => {
    let active = true
    setJob(null)
    setJobError('')
    api.get(`/jobs/${jobId}`)
      .then(({ data }) => {
        if (!active) return
        setJob(data)
        if (listingStatus(data) !== 'historical') {
          setValue('job_id', String(data.id), { shouldValidate: true })
        }
      })
      .catch((reason) => {
        if (active) setJobError(getErrorMessage(reason))
      })
    return () => { active = false }
  }, [jobId, setValue])

  useEffect(() => {
    let active = true
    api.get('/jobs')
      .then(({ data }) => {
        if (active) setJobs(data.filter((item) => listingStatus(item) !== 'historical'))
      })
      .catch((reason) => {
        if (active) setJobsError(getErrorMessage(reason))
      })
    return () => { active = false }
  }, [])

  const selectableJobs = useMemo(() => {
    const availableJobs = [...jobs]
    if (job && !availableJobs.some((item) => item.id === job.id) && listingStatus(job) !== 'historical') {
      availableJobs.unshift(job)
    }
    return availableJobs
  }, [job, jobs])
  const selectedJobId = watch('job_id')
  const selectedJob = selectableJobs.find((item) => String(item.id) === selectedJobId) || job
  const selectedResume = watch('resume')?.[0]

  async function submit(values) {
    clearErrors('root.server')
    setSuccess('')
    const payload = new FormData()
    payload.append('job_id', values.job_id)
    payload.append('full_name', values.full_name)
    payload.append('email', values.email)
    payload.append('phone', values.phone)
    payload.append('qualification', values.qualification)
    payload.append('experience', values.experience)
    payload.append('current_location', values.current_location)
    payload.append('skills', values.skills)
    payload.append('cover_letter', values.cover_letter)
    payload.append('consent_given', String(values.consent_given))
    payload.append('resume', values.resume)

    try {
      const { data } = await api.post('/applications', payload)
      setSuccess(data.message)
      reset({ ...initialApplication, job_id: values.job_id })
    } catch (reason) {
      setError('root.server', { type: 'server', message: getErrorMessage(reason) })
    }
  }

  if (!job && !jobError) return <div className="container loading-page"><span className="loader" /> Loading application…</div>
  if (jobError && !job) return <PageIntro label="Application" title="Role unavailable" description={jobError}><Link to="/careers" className="button button-lime">Return to careers <ArrowRight size={16} /></Link></PageIntro>
  if (job && listingStatus(job) === 'historical') return <PageIntro label="Application closed" title="This advertisement has expired." description="Historical listings are shown for reference only and do not accept applications."><Link to="/careers" className="button button-lime">Return to careers <ArrowRight size={16} /></Link></PageIntro>

  return <>
    <PageIntro label="Apply" title="Tell us a little about you." description={`Applying for ${selectedJob?.title || job.title} · ${selectedJob?.location || job.location}`}><Link to={`/careers/${jobId}`} className="back-link"><ArrowRight className="back-arrow" size={15} /> Back to role details</Link></PageIntro>
    <section className="section application-section"><div className="container form-layout"><form className="application-form" noValidate onSubmit={handleSubmit(submit)}>
      <div className="form-section-title"><span>01</span><div><h2>Your details</h2><p>Share your contact and experience information.</p></div></div>
      {jobsError && <p role="status" className="form-alert form-alert-error">Additional roles could not load. You can still apply for the selected profile.</p>}
      <div className="form-grid">
        <label className="form-field"><span>Full name <i>*</i></span><input autoComplete="name" placeholder="e.g. Aditi Patil" aria-invalid={Boolean(errors.full_name)} aria-describedby={errors.full_name ? 'full_name-error' : undefined} {...register('full_name')} /><FieldError id="full_name-error" error={errors.full_name} /></label>
        <label className="form-field"><span>Email address <i>*</i></span><input type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} /><FieldError id="email-error" error={errors.email} /></label>
        <label className="form-field"><span>Phone number <i>*</i></span><input type="tel" autoComplete="tel" placeholder="+91 98765 43210" aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'phone-error' : undefined} {...register('phone')} /><FieldError id="phone-error" error={errors.phone} /></label>
        <label className="form-field"><span>Highest qualification <i>*</i></span><input placeholder="Degree or qualification" aria-invalid={Boolean(errors.qualification)} aria-describedby={errors.qualification ? 'qualification-error' : undefined} {...register('qualification')} /><FieldError id="qualification-error" error={errors.qualification} /></label>
        <label className="form-field"><span>Years of experience <i>*</i></span><input placeholder="e.g. 3 years / Fresher" aria-invalid={Boolean(errors.experience)} aria-describedby={errors.experience ? 'experience-error' : undefined} {...register('experience')} /><FieldError id="experience-error" error={errors.experience} /></label>
        <label className="form-field"><span>Current location <i>*</i></span><input autoComplete="address-level2" placeholder="City, state" aria-invalid={Boolean(errors.current_location)} aria-describedby={errors.current_location ? 'current_location-error' : undefined} {...register('current_location')} /><FieldError id="current_location-error" error={errors.current_location} /></label>
        <label className="form-field full-width"><span>Skills <i>*</i></span><textarea rows="3" maxLength="3000" placeholder="List relevant skills, separated by commas" aria-invalid={Boolean(errors.skills)} aria-describedby={errors.skills ? 'skills-error' : undefined} {...register('skills')} /><FieldError id="skills-error" error={errors.skills} /></label>
        <label className="form-field full-width"><span>Cover letter <small>Optional</small></span><textarea rows="5" maxLength="5000" placeholder="A short introduction about your interest in this role…" aria-invalid={Boolean(errors.cover_letter)} aria-describedby={errors.cover_letter ? 'cover_letter-error' : undefined} {...register('cover_letter')} /><FieldError id="cover_letter-error" error={errors.cover_letter} /></label>
        <label className="form-field full-width"><span>Job profile <i>*</i></span>
          <select className="w-full rounded border border-slate-200 bg-white px-3 py-3 text-xs text-slate-700 outline-none focus:border-[#71aeb1] focus:ring-4 focus:ring-[#338f9415]" aria-invalid={Boolean(errors.job_id)} aria-describedby={errors.job_id ? 'job_id-error' : undefined} {...register('job_id')}>
            <option value="">Select a role</option>
            {selectableJobs.map((item) => <option key={item.id} value={String(item.id)}>{item.title} · {listingStatusText[listingStatus(item)]}</option>)}
          </select>
          <FieldError id="job_id-error" error={errors.job_id} />
        </label>
        <div className="form-field full-width">
          <span>Resume <i>*</i></span>
          <div className={`upload-box ${selectedResume ? 'upload-selected' : ''}`}>
            <input id="resume" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-invalid={Boolean(errors.resume)} aria-describedby={errors.resume ? 'resume-error' : 'resume-hint'} {...register('resume')} />
            <label htmlFor="resume"><span className="upload-icon"><FileText size={20} /></span><span><b>{selectedResume ? selectedResume.name : 'Choose a resume to upload'}</b><small id="resume-hint">{selectedResume ? `${(selectedResume.size / 1024 / 1024).toFixed(2)} MB · Ready to attach` : 'PDF, DOC or DOCX · 10 MB maximum'}</small></span><span className="upload-browse">{selectedResume ? 'Change file' : 'Browse files'}</span></label>
          </div>
          <FieldError id="resume-error" error={errors.resume} />
        </div>
      </div>
      <label className="consent-check"><input type="checkbox" aria-invalid={Boolean(errors.consent_given)} aria-describedby={errors.consent_given ? 'consent_given-error' : undefined} {...register('consent_given')} /><span>I consent to the use of my information for recruitment purposes. <b>*</b><small>This independent demo stores submitted information in the application database. Do not submit sensitive or real applicant data unless authorized.</small>{errors.consent_given && <FieldError id="consent_given-error" error={errors.consent_given} />}</span></label>
      {errors.root?.server && <div role="alert" className="form-alert form-alert-error">{errors.root.server.message}</div>}
      {success && <div role="status" className="form-alert form-alert-success"><CircleCheck size={18} />{success}</div>}
      <button className="button button-navy submit-button" disabled={isSubmitting}>{isSubmitting ? 'Submitting…' : 'Submit application'} {isSubmitting ? <span className="button-spinner" /> : <ArrowRight size={16} />}</button>
      <p className="demo-warning">This is an independent demo; a submitted application is not sent to LIST Software.</p>
    </form><aside className="application-aside"><div className="apply-aside-mark"><LockKeyhole size={21} /></div><h3>Thoughtful applications, secure handling.</h3><p>Resume files are validated by the API, stored outside public web access and only downloadable from the authenticated admin portal.</p><div><Check size={15} /> Server-side file signature checks</div><div><Check size={15} /> Restricted resume formats and size</div><div><Check size={15} /> Explicit privacy consent</div><a href="mailto:career@listspl.co.in">For genuine roles: career@listspl.co.in <ArrowUpRight size={13} /></a></aside></div></section>
  </>
}
