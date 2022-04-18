import './App.css';
import JobCard from './JobCard';
import jobData from './jobData'
import eduData from './eduData'
import linkedin from './images/linkedin.svg'
import email from './images/email.svg'

export default function App() {

  const jobCards = jobData.map(jobData => {
    return (
      <JobCard 
        company={jobData.company}
        role={jobData.role}
        duration={jobData.duration}
        tech={jobData.tech}
      />
  )})

  const eduCards = eduData.map(eduData => {
    return (
      <JobCard 
        company={eduData.company}
        role={eduData.role}
        duration={eduData.duration}
        tech={eduData.tech}
      />
  )})

  return (
    <div className="App">
      <header>
        <div>Rakesh Mhasawade</div>
        <div>C++/Web Dev</div>
        <div>Pune, India</div>
      </header>
      <div className='jobCards'>
        {jobCards}
      </div>
      <div className='jobCards'>
        {eduCards}
      </div>
      <footer>
        <div>Contact</div>
        <a target='_blank' href='https://www.linkedin.com/in/rakesh-mhasawade-268b1816/'>
          <img src={linkedin} height='20px'></img>
        </a>
        <a href='mailto:rakesh.mhasawade@hotmail.com' className='email'>
          <img src={email} height='20px'></img>
        </a>
      </footer>
    </div>
  );
}
