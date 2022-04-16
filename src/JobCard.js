import './App.css'

export default function JobCard(props) {
    return (
        <div className="job--card">
            <p className='company'>{props.company}</p>
            <p className='role'>{props.role}</p>
            <p className='duration'>{props.duration}</p>
            <p className='tech'>{props.tech}</p>
        </div>
    )
}