import { Link } from 'react-router'

export default function CityCard({ name, image }) {
  const params = new URLSearchParams({ city: name })

  return (
    <Link
      to={`/annonces?${params.toString()}`}
      className="overflow-hidden rounded-lg bg-white shadow-sm"
    >
      <img
        src={image}
        alt={name}
        className="h-40 w-full object-cover"
      />

      <div className="p-3">
        <strong className="block">{name}</strong>

        <span className="text-xs text-atba-clay">
          Voir les biens →
        </span>
      </div>
    </Link>
  )
}