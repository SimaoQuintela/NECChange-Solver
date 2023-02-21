import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Switch</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='flex h-screen justify-center items-center text-white bg-[#4A71E0] sm:bg-[#3658b7]'>
        <div className='w-auto h-auto rounded-2xl bg-[#4A71E0] lg:min-w-[35%] sm:shadow-2xl'>
          <div className='flex justify-center items-center p-10'>
            <Image alt='necc-logo' src='/logos/necc-white.svg' width={50} height={50} />
          </div>
          <div className='text-4xl text-center font-bold'>Register</div>
          <div className='py-4 text-center font-bold'>Create your account</div>
          <div className=''>
            <form className='p-10 rounded-xl space-y-[2%]'>
              <div className='flex flex-col space-y-[3%]'>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path></svg>
                  </div>
                  <input className='block w-full pl-10 py-2 rounded-full border border-white bg-transparent placeholder-slate-300' type='email' name='email' id='email' placeholder="name@alunos.uminho.pt"/>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input className='block w-full pl-10 py-2 rounded-full border border-white bg-transparent placeholder-slate-300' type='password' name='password' id='password' placeholder="Password"/>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="square" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  </div>
                  <input className='block w-full pl-10 py-2 rounded-full border border-white bg-transparent placeholder-slate-300' type='password' name='password' id='password' placeholder="Confirm password"/>
                </div>
              </div>
              <div className='flex pt-[5%] text-lg'>
                <button type='submit' className='block ml-auto mr-auto w-full py-2 rounded-full border border-[#1D4ED8] bg-[#1D4ED8] hover:bg-[#00248f]'>REGISTER</button>
              </div>
              <div className='flex justify-center text-sm'>
                <div className=''>Already have an account? <a href='..' className='underline'> Login</a></div>
              </div>
            </form>
          </div>
        </div>

        <footer className='absolute bottom-0 left-0 w-full h-20 flex justify-center items-center text-white bg-[#4A71E0] sm:bg-[#3658b7]'>
          <div className='text-sm'>
            <p>© 2023 designed by <a href='https://necc.di.uminho.pt/' className='underline'>NECC</a>. All rights reserved.</p>
          </div>
        </footer>

      </main>
    </>
  )
}
