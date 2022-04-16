import './App.css';
import JobCard from './JobCard';
import jobData from './jobData'
import './linkedin.svg'

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
      <footer>
        <div>Contact</div>
        {/* <a target="_blank" href='abc'>
          <img src='linkedin.svg' alt='LinkedIn'></img>
        </a> */}
        <div><a href='mailto:rakesh.mhasawade@hotmail.com' className='email'>Email</a></div>
      </footer>
    </div>
  );
}

{/* <JobCard 
company='Ubisoft'
role='Senior Programmer'
duration='September 2019 - Present'
tech='C#, Javascript, C++, Test'
/> */}
