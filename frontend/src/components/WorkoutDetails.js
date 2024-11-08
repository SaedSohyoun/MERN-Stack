import { useWorkoutsContext } from "../hooks/useWorkoutsContext"

import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const WorkoutDetails = ({ Workout }) => {
    const { dispatch } = useWorkoutsContext()

    const handleClick = async () => {
        const response = await fetch('/api/workouts/' + Workout._id, {
            method: 'DELETE'
        })
        const json = await response.json()

        if (response.ok) {
            dispatch({ type: 'DELETE_WORKOUT', payload: json })
        }
    }

    return (
        <div className="workout-details">
            <h4>{Workout.title}</h4>
            <p><strong>Load (kg):</strong>{Workout.load}</p>
            <p><strong>Reps:</strong>{Workout.reps}</p>
            <p>{formatDistanceToNow(new Date(Workout.createdAt), { addSuffix: true })}</p>
            <span className="material-symbols-outlined" onClick={handleClick}>delete</span>
        </div>
    )
}

export default WorkoutDetails