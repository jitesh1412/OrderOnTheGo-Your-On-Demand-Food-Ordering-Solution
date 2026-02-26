import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await axios.get(
  "http://localhost:5000/api/admin/public-restaurants"
);

      setRestaurants(res.data.filter(r => r.isApproved));
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="container mt-4">
      <h2>All Restaurants</h2>

      <div className="row mt-3">
        {restaurants.map((restaurant) => (
          <div key={restaurant._id} className="col-md-4 mb-4">
            <div className="card p-3">
              <h5>{restaurant.username}</h5>

              <Link
  to={`/restaurant-menu/${restaurant._id}`}
  className="btn btn-dark mt-2"
>
  View Menu
</Link>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Restaurants;
