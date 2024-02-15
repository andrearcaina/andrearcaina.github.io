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
                <p>
                    a 2nd year co-op student studying computer science at toronto metropolitan university <br />
                    an IBM z ambassador :D <br />
                    developing a full stack web application called WizGallery <br />
                </p>
                
                <br />
                
                <p className="text-blue-500">
                    ~ <br />
                    ~ <br />
                    ~ <br />
                    ~ <br />
                    ~ <br />
                    ~ <br />
                    ~ <br />
                    ~
                </p>

                <Form Route="aboutme.txt" Command=":q!"/>
            </div>
        </div>
    );
}