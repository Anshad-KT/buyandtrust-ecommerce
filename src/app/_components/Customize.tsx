import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

interface SportCard {
  title: string
  image: string
}

const sports: SportCard[] = [
  {
    title: "Basketball",
    image: "/home/basketball.jpg",
  },
  {
    title: "Football",
    image: "/home/football.jpg", 
  },
  {
    title: "Cricket",
    image: "/home/cricket.jpg",
  },
  {
    title: "Kabaddi",
    image: "/kabaddi.jpeg",
  },
]

export default function JerseyCustomizer() {
  return (
    <div className="  bg-[#222222]  lg:pb-40 py-16  lg:px-28   px-4">
      <div className=" mx-auto">
        <h1 className="text-2xl md:text-5xl font-bold text-center text-white mb-12 ">
          CUSTOMIZE YOUR{" "}
          <span className="text-red-500">JERSEY</span>
        </h1>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {sports.map((sport) => (
            <Link href={"/customize"} key={sport.title}>
            <Card key={sport.title} className="bg-[#222222]  border-[#D6D6D6] rounded-none">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden ">
                  <Image
                    src={sport.image || "/placeholder.svg"}
                    alt={`${sport.title} jersey customization`}
                    fill
                    className="object-cover transition-transform hover:scale-105 p-3"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-center text-white">{sport.title}</h2>
                </div>
              </CardContent>
            </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href={"/customize"}>
          <Button 
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white px-10 rounded-none  py-2   font-medium"
          >
            Customize
          </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

