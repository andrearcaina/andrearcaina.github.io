import Link from 'next/link';
import Form from './form';
    
export default function Code() {
    return (
        <div className="bg-black p-4 rounded-lg text-[0.95rem]/[1.75rem]">
            <p><span className="text-green-800">aarcaina@portfolio</span>:~$ echo &quot; <br />
                &gt; a 3rd year co-op student studying computer science at <Link className="underline italic hover:text-green-500 duration-300 transition-all" target="_blank"
                    href="https://www.torontomu.ca/" passHref>
                    toronto metropolitan university
                </Link>. &quot; &gt;&gt; aboutme.txt
            </p>

            <br />

            <p><span className="text-green-800">aarcaina@portfolio</span>:~$ echo &quot; <br />
                &gt; previously interned at <Link className="underline italic hover:text-green-500 duration-300 transition-all" target="_blank"
                    href="https://dkl.com" passHref>
                    DataKinetics
                </Link> as an R&D Engineer :D &quot; &gt;&gt; aboutme.txt
            </p>

            <br />
            
            <p><span className="text-green-800">aarcaina@portfolio</span>:~$ echo &quot; <br />
                &gt; developing a full stack <Link className="underline italic hover:text-green-500 duration-300 transition-all" target="_blank"
                    href="https://github.com/andrearcaina/echo-web" passHref>
                    messaging app
                </Link> using Go and Next.js &quot; &gt;&gt; aboutme.txt
            </p>

            <Form Route="about" Command="vim aboutme.txt"/>
        </div>
    );
}