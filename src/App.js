import React, { useState, useEffect } from "react";

function App() {
  const [query, setQuery] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState(null);

  // Fetch random recipes on load (home feed)
  useEffect(() => {
    fetchRandomRecipes();
  }, []);

  // Fetch recipes when typing (live search)
  useEffect(() => {
    if (!query.trim()) return;
    const delay = setTimeout(() => {
      fetchSearchResults(query);
    }, 600);
    return () => clearTimeout(delay);
  }, [query]);

  // Fetch random recipes
  const fetchRandomRecipes = async () => {
    try {
      setLoading(true);
      let all = [];
      for (let i = 0; i < 10; i++) {
        const res = await fetch(
          "https://www.themealdb.com/api/json/v1/1/random.php"
        );
        const data = await res.json();
        if (data.meals) all.push(data.meals[0]);
      }
      setMeals(all);
    } catch (e) {
      setError("Failed to load random recipes.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipes by both name & ingredient
  const fetchSearchResults = async (text) => {
    try {
      setLoading(true);
      const [byNameRes, byIngRes] = await Promise.all([
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${text}`),
        fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${text}`),
      ]);
      const nameData = await byNameRes.json();
      const ingData = await byIngRes.json();

      const combined = [...(nameData.meals || []), ...(ingData.meals || [])];

      // Remove duplicates
      const unique = Array.from(
        new Map(combined.map((m) => [m.idMeal, m])).values()
      );

      if (unique.length === 0) setError("No recipes found.");
      else setError("");

      setMeals(unique);
    } catch (e) {
      setError("Failed to fetch recipes.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch detailed recipe info
  const fetchMealDetails = async (id) => {
    try {
      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
      );
      const data = await res.json();
      setSelectedMeal(data.meals[0]);
    } catch {
      setError("Failed to load details.");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🍽️ Hi Taylor - Find Your Recipe</h1>
      <p style={styles.note}>Type any ingredient or recipe name</p>

      <input
        type="text"
        placeholder="Search recipes... eg:chicken"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />

      {loading && <p>Loading recipes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={styles.grid}>
        {meals.map((meal) => (
          <div
            key={meal.idMeal}
            style={styles.card}
            onClick={() => fetchMealDetails(meal.idMeal)}
          >
            <img
              src={meal.strMealThumb}
              alt={meal.strMeal}
              style={styles.image}
            />
            <h3 style={styles.mealName}>{meal.strMeal}</h3>
          </div>
        ))}
      </div>

      {/* Recipe detail modal */}
      {selectedMeal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2>{selectedMeal.strMeal}</h2>
            <img
              src={selectedMeal.strMealThumb}
              alt={selectedMeal.strMeal}
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <p>
              <b>Category:</b> {selectedMeal.strCategory}
            </p>
            <p>
              <b>Area:</b> {selectedMeal.strArea}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              {selectedMeal.strInstructions}
            </p>

            {selectedMeal.strYoutube && (
              <p>
                ▶️{" "}
                <a
                  href={selectedMeal.strYoutube}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch on YouTube
                </a>
              </p>
            )}
            <button
              style={styles.closeBtn}
              onClick={() => setSelectedMeal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <b></b>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Poppins, sans-serif",
    textAlign: "center",
    padding: "20px",
  },
  title: { color: "#0070f3" },
  note: { color: "#555" },
  input: {
    width: "80%",
    maxWidth: "400px",
    padding: "10px",
    margin: "20px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  image: { width: "100%", borderRadius: "8px" },
  mealName: { marginTop: "10px" },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  modalContent: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    maxWidth: "700px",
    width: "100%",
    maxHeight: "90vh",
    overflowY: "auto",
    textAlign: "left",
  },
  closeBtn: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "6px",
    background: "#0070f3",
    color: "#fff",
    cursor: "pointer",
  },
  footer: { marginTop: "30px", color: "#777" },
};

export default App;
