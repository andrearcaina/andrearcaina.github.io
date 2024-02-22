'use client';
import { Main, Interests, Code } from '@/components';

export default function About() {
    return (
        <Main className="text-white">
            <Interests />
            <Code />
        </Main>
    );
}
