"use client"
import Image from "next/image";
import Link from "next/link";
import Authentication from "./_components/Authentication";
import { Button } from "@/components/ui/button";
import ProfileAvatar from "./_components/ProfileAvatar";
import { useAuthContext } from "./provider";
import { Eye, FolderOpen, Gift, PenTool } from "lucide-react";

const features = [
  { icon: PenTool, title: "Sketch to code", description: "Upload a photo or screenshot of any wireframe and get React + Tailwind code" },
  { icon: Eye, title: "Live preview", description: "Check it on desktop, tablet and mobile, ask for changes in plain English, and edit the code yourself" },
  { icon: Gift, title: "Free to try", description: "Sign in with Google and get 3 free credits every day, no card needed" },
  { icon: FolderOpen, title: "Saved designs", description: "Your designs are saved. Download any of them as a React component or an HTML file that opens anywhere" },
];

export default function Home() {
  const user = useAuthContext();
  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur">
        <nav className="max-w-[85rem] h-16 mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between" aria-label="Global">
          <a href="/" className='flex items-center gap-2'>
            <Image src={'/logo.svg'} alt='logo' width={100} height={100}
              className='w-9 h-9' />
            <h2 className='font-bold text-lg'>BlueprintAI</h2>
          </a>
          {!user?.user?.email ? <Authentication>
            <Button variant='outline' size='sm'>Sign in</Button>
          </Authentication> :
            <ProfileAvatar />
          }
        </nav>
      </header>
      <div className="relative overflow-hidden before:absolute before:top-0 before:start-1/2 before:bg-[url('https://preline.co/assets/svg/examples/polygon-bg-element.svg')] dark:before:bg-[url('https://preline.co/assets/svg/examples-dark/polygon-bg-element.svg')] before:bg-no-repeat before:bg-top before:bg-cover before:size-full before:-z-[1] before:transform before:-translate-x-1/2">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">

          <div className="mt-5 max-w-2xl text-center mx-auto">
            <h1 className="block font-bold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
              Convert Wireframe
              <span className="bg-clip-text bg-gradient-to-tl from-blue-600 to-violet-600 text-transparent"> To Code</span>
            </h1>
          </div>
          <div className="mt-5 max-w-3xl text-center mx-auto">
            <p className="text-lg text-gray-600 dark:text-neutral-400">
              Sketch your layout, upload it, and get a working React + Tailwind page you can preview, edit and keep.</p>
          </div>
          <div className="mt-8 gap-3 flex justify-center">
            {user?.user?.email ? <>
              <a className="inline-flex justify-center items-center
      gap-x-3 text-center bg-gradient-to-tl from-blue-600
       to-violet-600 hover:from-violet-600 hover:to-blue-600 border border-transparent text-white text-sm font-medium rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 py-3 px-4 dark:focus:ring-offset-gray-800"
                href="/dashboard">
                Go to Workspace
                <svg className="flex-shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </a>
              <a href="/designs" className="inline-flex justify-center items-center gap-x-2 text-center border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium rounded-md py-3 px-4">
                My Designs
              </a>
            </>
              : <Authentication >
                <Button>Get Started</Button>
              </Authentication>
            }
          </div>
        </div>
      </div>
      <div>
        <Image src={'/Wireframetocode.png'} alt="image" width={800} height={900}
          className="w-full h-[300px] object-contain"
        />
      </div>

      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 items-start gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col p-4 md:p-7">
              <div className="flex justify-center items-center size-12 bg-blue-600 rounded-xl">
                <feature.icon className="size-6 text-white" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-gray-800 dark:text-white">{feature.title}</h3>
              <p className="mt-1 text-gray-600 dark:text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
