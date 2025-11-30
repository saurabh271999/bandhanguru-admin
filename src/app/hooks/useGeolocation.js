"use client";
import axios from "axios";
import { useEffect, useState } from "react";

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function getTitleBasedOnDomain() {
  const hostname = window.location.hostname;
  let title = "Cling Info Tech";

  if (hostname.includes("clinginfotech.com")) {
    title = "Cling Info Tech";
  } else if (hostname.includes("clinginfotech.com")) {
    title = "Cling Info Tech";
  }

  return title;
}

async function getAddress(latitude, longitude) {
  const title = getTitleBasedOnDomain();

  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAZiNn58q1I433czw_eTrvB-pg-ZXcGOkc`
    );
    const formattedAddresses = response.data.results.map(
      ({ formatted_address }) => formatted_address
    );
    return {
      title,
      addresses: formattedAddresses,
    };
  } catch (error) {
    console.error("Error fetching address:", error);
    throw error;
  }
}

async function ipLookUp() {
  try {
    const response = await axios.get(
      "https://ipgeolocation.abstractapi.com/v1/?api_key=57aa886bc8784e2384bcd19b0d725897"
    );
    const { latitude, longitude } = response.data;
    return getAddress(latitude, longitude);
  } catch (error) {
    console.error("IP Lookup failed:", error);
    return null;
  }
}

const useGeoLocation = () => {
  const [addressData, setAddressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        if (navigator.geolocation && navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({
            name: "geolocation",
          });

          if (permissionStatus.state === "granted") {
            navigator.geolocation.getCurrentPosition(async (pos) => {
              const { latitude, longitude } = pos.coords;
              const address = await getAddress(latitude, longitude);
              setAddressData(address);
              setLoading(false);
            });
          } else if (permissionStatus.state === "prompt") {
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const { latitude, longitude } = pos.coords;
                const address = await getAddress(latitude, longitude);
                setAddressData(address);
                setLoading(false);
              },
              (err) => {
                console.error("Error with geolocation prompt:", err);
                setError("Location access denied or failed.");
                setLoading(false);
              },
              options
            );
          } else if (permissionStatus.state === "denied") {
            const address = await ipLookUp();
            setAddressData(address);
            setLoading(false);
          }
        } else {
          const address = await ipLookUp();
          setAddressData(address);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error fetching location:", err);
        setError("Failed to fetch location.");
        setLoading(false);
      }
    };

    fetchLocation();
  }, []);

  return { addressData, loading, error };
};

export default useGeoLocation;
