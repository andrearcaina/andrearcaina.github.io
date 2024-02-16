import Link from 'next/link';
import Form from './form';

export default function Code() {
    return (
        <div>
            <p className="text-lg">
                <Link href="https://www.vim.org/" target="_blank" className="underline hover:text-green-500 hover:animate-pulse duration-300 transition-all">Vim</Link> is
                just a normal text editor... so here&apos;s the output from the code in the previous page!
            </p>
            
            <br />

            <div className="bg-black p-4 rounded-lg text-[0.95rem]/[1.75rem]">
                <div>
                    <p class="text-gray-500">1</p>
                    <p><span class="text-gray-500">2</span> a 2nd year co-op student studying computer science at Toronto Metropolitan University</p>
                    <p class="text-gray-500">3</p>
                    <p><span class="text-gray-500">4</span> an IBM z ambassador :D</p>
                    <p class="text-gray-500">5</p>
                    <p><span class="text-gray-500">6</span> developing a full stack web application called WizGallery</p>
                    <p class="text-gray-500">7</p>
                </div>
                
                <div className="text-blue-500">
                    <p> ~ </p>
                    <p> ~ </p>
                    <p> ~ </p>
                    <p> ~ </p>
                    <p> ~ </p>
                    <p> ~ </p>
                    <p> ~ </p>
                    <p> ~ </p>
                </div>

                <Form Route="aboutme.txt" Command=":q!"/>
            </div>
        </div>
    );
}