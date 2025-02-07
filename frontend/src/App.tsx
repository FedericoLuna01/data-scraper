import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { getData } from "./lib/api"


function App() {
  const formSchema = z.object({
    query: z.string().min(2).max(100),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const data = await getData(values.query)
    console.log(values, data);
  }

  return (
    <div className='container mx-auto flex items-center justify-center flex-col'>
      <h1 className="text-5xl font-bold my-20">
        Google maps scraper
      </h1>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Búsqueda
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Paisajismo Rosario"
                      className="w-96"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Buscar</Button>
          </form>
        </Form>
      </div>
      <div>
        Tabla
      </div>
    </div>
  )
}

export default App
