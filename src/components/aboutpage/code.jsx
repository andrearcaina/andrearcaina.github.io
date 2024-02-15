import Link from 'next/link';
import Form from './form';
    
export default function Code() {
    return (
        <div className="bg-black p-4 rounded-lg text-[0.95rem]/[1.75rem]">
            <p><span className="text-green-800">aarcaina@portfolio</span>~$ echo &quot; <br />
                &gt; a 2nd year co-op student studying computer science at <Link className="underline italic hover:text-green-500 duration-300 transition-all" target="_blank"
                    href="https://www.torontomu.ca/" passHref>
                    toronto metropolitan university
                </Link>. &quot; &gt;&gt; aboutme.txt
            </p>

            <br />

            <p><span className="text-green-800">aarcaina@portfolio</span>~$ echo &quot; <br />
                &gt; an <Link className="underline italic hover:text-green-500 duration-300 transition-all" target="_blank"
                    href="https://www.linkedin.com/posts/andre-arcaina_i-am-now-an-ibm-z-student-ambassador-for-activity-7127723378488082432-fh1F?utm_source=share&utm_medium=member_desktop" passHref>
                    IBM
                </Link> z ambassador :D &quot; &gt;&gt; aboutme.txt
            </p>

            <br />
            
            <p><span className="text-green-800">aarcaina@portfolio</span>~$ echo &quot; <br />
                &gt; developing a full stack web application called <Link className="underline italic hover:text-green-500 duration-300 transition-all" target="_blank"
                    href="https://github.com/andrearcaina/WizGallery" passHref>
                    WizGallery
                </Link>! &quot; &gt;&gt; aboutme.txt
            </p>

            <Form Route="about" Command="vim aboutme.txt"/>
        </div>
    );
}