import { useState, useEffect } from 'react';

export default function Blockquote() {
    const [synonyms, setSynonyms] = useState([]);
    const [currentSynonym, setCurrentSynonym] = useState("humble abode");
    const text = `welcome to my ${currentSynonym} :D`;

    useEffect(() => {
        const fetchSynonyms = async () => {
            try {
                const res = await fetch('/data/synonyms.json');
                const data = await res.json();
                setSynonyms(data);
            } catch (error) {
                console.error('Error fetching synonyms:', error);
            }
        };

        fetchSynonyms();
    }, []);

    useEffect(() => {
        const synonymsInterval = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * synonyms.length);
            setCurrentSynonym(synonyms[randomIndex].text);
        }, 2000);

        return () => clearInterval(synonymsInterval);
    }, [synonyms]);

    return (
        <div>
            <blockquote className="p-4 my-4 border-l-2 border-gray-400 bg-gray-800 text-[1.1rem]/[1.75rem] sm:text-lg">
                <span className="leading-relaxed text-gray-300 italic">
                    {text}
                </span>
            </blockquote>
            
            <br />
        </div>
    );
}
