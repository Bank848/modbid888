"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useServerAction } from "zsa-react"

import { signInAction } from "~/app/(auth)/sign-in/actions"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { useToast } from "~/hooks/use-toast"

const loginSchema = z.object({
  email: z.string().email().min(1),
  password: z.string().min(6, {
    message: "Password is required to sign-in",
  }),
})

export default function SignIn() {
  const { toast } = useToast()
  const { execute } = useServerAction(signInAction, {
    onError({ err }) {
      toast({
        title: "Something went wrong",
        description: err.message,
        variant: "destructive",
      })
    },
    onSuccess() {
      toast({
        title: "Let's Go!",
        description: "Enjoy your session",
      })

      setTimeout(() => {
        window.location.href = "/minigames"
      }, 500)
    },
  })

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    execute(data)
  }

  return (
    <div className="w-full grid-cols-1 grid xl:grid-cols-2 h-screen">
      <span className="w-full bg-[url('/static/image/sign-in.png')] bg-cover bg-no-repeat bg-left xl:block hidden" />
      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full mx-10">
          <CardHeader>
            <CardTitle className="font-alagard text-4xl">Sign-in</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="gap-5 flex flex-col">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Enter your email"
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="w-full"
                          placeholder="Enter your password"
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>

              <CardFooter className="flex flex-row justify-between w-full items-center">
                <Button className="font-alagard" type="submit">
                  Let me in
                </Button>
                <Link href="/sign-up  ">
                  <p className="text-sm text-muted-foreground cursor-pointer hover:underline">
                    don&apos;t have an account? click here!
                  </p>
                </Link>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
