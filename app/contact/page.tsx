"use client"

import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FadeInUp, TextShimmer, PageTransition, ButtonMotion } from "@/components/motion-components"

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [messageSent, setMessageSent] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [disableButton, setDisableButton] = useState(false)
  const [noForm, setNoForm] = useState(0)
  const [, startTransition] = useTransition()

  const sendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current) return

    const name = (formRef.current.elements.namedItem("name") as HTMLInputElement)?.value.trim()
    const email = (formRef.current.elements.namedItem("email") as HTMLInputElement)?.value.trim()
    const message = (formRef.current.elements.namedItem("message") as HTMLTextAreaElement)?.value.trim()

    const bump = () => setNoForm((n) => n + 1)

    if (!name && !email && !message && noForm < 10) { setMessageSent(false); setErrorMessage("fill out the form :("); bump(); return }
    if (!name && !email && !message && 10 <= noForm && noForm < 20) { setMessageSent(false); setErrorMessage("are we really doing this again?"); bump(); return }
    if (!name && !email && !message && 20 <= noForm && noForm < 30) { setMessageSent(false); setErrorMessage("i'm not playing this game anymore."); bump(); return }
    if (!name && !email && !message && 30 <= noForm && noForm < 40) { setMessageSent(false); setErrorMessage("bye!"); bump(); return }
    if (!name && !email && !message && noForm === 40) { setMessageSent(false); setErrorMessage(":)"); return }
    if (!name) { setMessageSent(false); setErrorMessage("please enter a name!"); return }
    if (!email) { setMessageSent(false); setErrorMessage("please enter an email!"); return }
    if (!message) { setMessageSent(false); setErrorMessage("please enter a message!"); return }
    if (!email.includes("@") || !email.includes(".")) { setMessageSent(false); setErrorMessage("please enter a valid email!"); return }
    if (!/^[a-zA-Z\s]+$/.test(name)) { setMessageSent(false); setErrorMessage("invalid name. name should only contain letters and spaces."); return }

    setDisableButton(true)

    startTransition(async () => {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            message
          }),
        })

        const data = await response.json()

        console.log(data)

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send message')
        }

        setMessageSent(true)
        setErrorMessage("")
        setDisableButton(false)
        formRef.current?.reset()
      } catch (error) {
        setMessageSent(false)
        setErrorMessage(error instanceof Error ? error.message : "something went wrong. please try again later")
        setDisableButton(false)
      }
    })
  }

  return (
    <PageTransition>
      <div className="py-8 md:py-12 max-w-2xl mx-auto">
        <FadeInUp>
          <div className="mb-8">
            <h1 className="mb-4 text-2xl font-semibold">
              <TextShimmer>contact</TextShimmer> me
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Have a question or want to work together? Send me a message using the form below, or reach out directly at{" "}
              <span>
                dtandre331<span className="text-xs align-super mx-0.5">[at]</span>gmail<span className="text-xs align-super mx-0.5">[dot]</span>com
              </span>
            </p>
          </div>
        </FadeInUp>
        
        <FadeInUp delay={0.2}>
          <form ref={formRef} onSubmit={sendEmail} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                  Name
                </Label>
                <Input 
                  id="name" 
                  name="name" 
                  className="w-full"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                  Email
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  name="email" 
                  className="w-full"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                  Message
                </Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  className="w-full h-32 resize-none"
                  placeholder="Tell me about your project or just say hello..."
                />
              </div>
            </div>

            <div className="pt-2">
              <ButtonMotion>
                <Button 
                  type="submit" 
                  disabled={disableButton}
                  className="px-8 py-2 font-medium"
                >
                  {disableButton ? "Sending..." : "Send Message"}
                </Button>
              </ButtonMotion>
            </div>
          </form>
        </FadeInUp>

        {messageSent && (
          <FadeInUp delay={0.4}>
            <div className="mt-2 rounded-md px-4 py-2 text-green-700">
              Message sent! I will get back to you soon :D
            </div>
          </FadeInUp>
        )}

        {errorMessage && noForm < 40 ? (
          <FadeInUp delay={0.4}>
            <div className="mt-2 rounded-md px-4 py-2 text-red-500">{errorMessage}</div>
          </FadeInUp>
        ) : noForm === 40 ? (
          <FadeInUp delay={0.4}>
            <div className="mt-2 space-y-2 rounded-md px-4 py-2 text-red-500">
              <div>{errorMessage}</div>
              <iframe
                className="h-[250px] w-[300px] rounded-md sm:h-[360px] sm:w-[500px]"
                loading="lazy"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </FadeInUp>
        ) : null}
      </div>
    </PageTransition>
  )
}
