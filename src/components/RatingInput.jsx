const ratings = [1, 2, 3, 4, 5];

function RatingInput({ value, onChange, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ratings.map((rating) => {
        const active = value === rating;
        return (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            onClick={() => onChange(rating)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {rating} Star{rating > 1 ? "s" : ""}
          </button>
        );
      })}
    </div>
  );
}

export default RatingInput;
