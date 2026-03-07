import "./ReviewsList.css";

const DEFAULT_REVIEWS = [
  { id: 1, name: "Mamadou D.",  rating: 5, text: "Excellent travail, très professionnel et rapide !",  date: "Il y a 2 jours" },
  { id: 2, name: "Aïssatou F.", rating: 5, text: "Je recommande vivement, problème résolu en moins d'une heure.", date: "Il y a 5 jours" },
  { id: 3, name: "Cheikh N.",   rating: 4, text: "Bon service, prix correct. Je referai appel à lui.", date: "Il y a 1 semaine" },
];

export default function ReviewsList({ reviews = DEFAULT_REVIEWS }) {
  return (
    <div className="reviews-list">
      <div className="reviews-list__title">Derniers avis</div>
      {reviews.map((r) => (
        <div key={r.id} className="reviews-list__item">
          <div className="reviews-list__row">
            <span className="reviews-list__name">{r.name}</span>
            <span className="reviews-list__stars">{"★".repeat(r.rating)}</span>
          </div>
          <div className="reviews-list__text">{r.text}</div>
          <div className="reviews-list__date">{r.date}</div>
        </div>
      ))}
    </div>
  );
}
