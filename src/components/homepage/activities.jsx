import { useState, useEffect } from 'react';

export default function Activities() {
    const [activities, setActivities] = useState([]);
    const [currentActivity, setCurrentActivity] = useState("");

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const res = await fetch('/data/activities.json');
                const data = await res.json();
                setActivities(data);
                setCurrentActivity(getRandomActivity(data));
            } catch (err) {
                console.error(err);
            }
        }

        fetchActivities();
    }, []);

    const getRandomActivity = (data) => {
        const randomIndex = Math.floor(Math.random() * data.length);
        return data[randomIndex].text;
    }

    const handleClick = () => {
        setCurrentActivity(getRandomActivity(activities));
    }

    return (
        <p className="text-[1.1rem]/[1.75rem] sm:text-lg">
            binge watching shows,
            playing video games or <span className="select-none italic underline cursor-pointer hover:text-green-500 hover:animate-pulse duration-300 transition-all" onClick={handleClick}>{currentActivity}</span>.
        </p>
    )
}
