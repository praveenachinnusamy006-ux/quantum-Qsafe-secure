import { Shell } from "@/components/layout/Shell";
import { useCreateVendor } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { ShieldPlus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.string().min(1, "Please select a category."),
  headquarters: z.string().min(2, "Headquarters location is required."),
  website: z.string().url("Must be a valid URL."),
  description: z.string().min(10, "Provide a brief description of the vendor."),
  certificationLevel: z.string().optional(),
});

export default function AddVendor() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createVendor = useCreateVendor();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      headquarters: "",
      website: "https://",
      description: "",
      certificationLevel: "none",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createVendor.mutate(
      values,
      {
        onSuccess: (data) => {
          toast({
            title: "Vendor Registered",
            description: `${data.name} has been added to the directory.`,
          });
          setLocation(`/vendors/${data.id}`);
        },
        onError: () => {
          toast({
            title: "Registration Failed",
            description: "An error occurred while adding the vendor.",
            variant: "destructive",
          });
        }
      }
    );
  }

  return (
    <Shell>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono flex items-center gap-2">
            <ShieldPlus className="w-6 h-6 text-primary" />
            Register New Vendor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Add a new technology partner to the secure directory for intelligence monitoring.
          </p>
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="font-mono text-lg">Vendor Profile Details</CardTitle>
            <CardDescription>Basic information required for initial risk assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Entity Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Security Corp" className="bg-background/50 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Operational Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 font-mono text-sm">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Network Security">Network Security</SelectItem>
                            <SelectItem value="Identity & Access">Identity & Access</SelectItem>
                            <SelectItem value="Endpoint Protection">Endpoint Protection</SelectItem>
                            <SelectItem value="Cloud Security">Cloud Security</SelectItem>
                            <SelectItem value="Compliance">Compliance</SelectItem>
                            <SelectItem value="Threat Intel">Threat Intel</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Primary Domain (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." className="bg-background/50 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="headquarters"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Headquarters Location</FormLabel>
                        <FormControl>
                          <Input placeholder="San Francisco, CA" className="bg-background/50 font-mono text-sm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="certificationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Initial Certification Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background/50 font-mono text-sm">
                            <SelectValue placeholder="Select Level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="bronze">Bronze</SelectItem>
                          <SelectItem value="silver">Silver</SelectItem>
                          <SelectItem value="gold">Gold</SelectItem>
                          <SelectItem value="platinum">Platinum</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Entity Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Brief overview of the vendor's capabilities and role in the ecosystem..." 
                          className="bg-background/50 font-mono text-sm min-h-[120px] resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
                  <Button type="button" variant="outline" onClick={() => setLocation("/vendors")} className="font-mono">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createVendor.isPending} className="font-mono font-bold tracking-wide">
                    {createVendor.isPending ? "REGISTERING..." : "REGISTER VENDOR"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
