import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Form({ Command, Route }) {
    const [fileName, setFileName] = useState('');
    const router = useRouter();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (Route == 'about' && fileName === 'vim aboutme.txt') {
            router.push(`/about/${Command.split(' ')[1]}`);
        } else if (Route == 'aboutme.txt' && fileName === ':q!') {
            router.push('/about');
        } else {
            alert(`Invalid command. Try again! Type: ${Command}`);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <input
                type="text"
                placeholder={`type '${Command}', then press enter!`}
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={handleKeyDown} 
                className="bg-black px-2 py-1 w-full rounded-lg"
            />
        </form>
    );
};
