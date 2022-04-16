import './App.css'

export default function JobCard(props) {
    return (
        <div className="job--card">
            <p>{props.company}</p>
            <p>{props.role}</p>
            <p>{props.duration}</p>
            <p>{props.tech}</p>
        </div>
    )
}