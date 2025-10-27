import React, { useRef, useState, useEffect } from "react";
import Select from "react-select";
import GetAPI from "../../utilities/GetAPI";
import { Autocomplete } from "@react-google-maps/api";
import { inputStyle } from "../../utilities/Input";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { IoHomeOutline } from "react-icons/io5";
import { GrMapLocation } from "react-icons/gr";

const LocationStep = ({ setFormData, formData }) => {
  const { data: countriesData } = GetAPI("users/getCountriesAndCities");
  const { data: zoneData, error } = GetAPI("admin/getAllZones");
  const [mapCenter, setMapCenter] = useState({
    lat: 31.5204,
    lng: 74.3587,
  });

  const [country, setCountry] = useState({
    countries: formData.country || null,
    selectedCountryShortName: formData.selectedCountryShortName || null,
    location: null,
  });
  const [cities, setCities] = useState([]);

  const getCountries =
    countriesData?.data?.countries?.map((countr) => ({
      value: countr.id,
      label: countr.name,
      short: countr.shortName,
      lat: countr.latitude,
      lng: countr.longitude,
    })) || [];
  const getZone =
    zoneData?.data?.map((zone) => ({
      value: zone.id,
      label: zone.name,
      cityId: zone.cityId,
    })) || [];

  const handleZoneChange = (selectedZone) => {
    setFormData({
      ...formData,
      zoneId: selectedZone.value,
      cityId: selectedZone.cityId,
    });
  };
  const handleCountryChange = (selectedCountry) => {
    const selectCountry =
      getCountries.find((country) => country.value === formData.country) ||
      null;
    setCountry({
      ...country,
      countries: selectCountry,
      selectedCountryShortName: selectedCountry.short,
    });
    setFormData({
      ...formData,
      country: selectedCountry.value,
      selectedCountryShortName: selectedCountry.short,
    });
    setMapCenter({
      lat: selectedCountry.lat || 25.276987,
      lng: selectedCountry.lng || 55.296249,
    });

    // Filter cities for the selected country
    const filteredCities =
      countriesData?.data?.countries?.find(
        (countr) => countr.id === selectedCountry.value
      )?.cities || [];

    setCities(
      filteredCities.map((city) => ({
        value: city.id,
        label: city.name,
      }))
    );
  };

  useEffect(() => {
    // Get user's current location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.warn(
            "Geolocation permission denied. Using Lahore as default."
          );
        }
      );
    }
  }, []);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = getCountries.find(
        (country) => country.value === formData.country
      );

      if (selectedCountry) {
        setCountry({
          countries: selectedCountry,
          selectedCountryShortName: selectedCountry.short,
        });

        setMapCenter({
          lat: selectedCountry.lat || 25.276987,
          lng: selectedCountry.lng || 55.296249,
        });

        // Filter cities for the selected country
        const filteredCities =
          countriesData?.data?.countries?.find(
            (countr) => countr.id === selectedCountry.value
          )?.cities || [];

        setCities(
          filteredCities.map((city) => ({
            value: city.id,
            label: city.name,
          }))
        );
      }
    }
  }, [formData.country, countriesData]);

  return (
    <div className="space-y-4">
      <h2 className="font-omnes text-2xl sm:text-[28px] text-theme-black-2 font-semibold">
        Select the Country you want to work
      </h2>

      {/* Country Select */}
      <Select
        value={country.countries}
        onChange={handleCountryChange}
        options={getCountries}
        inputId="countries"
        placeholder="Select Country"
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: "8px",
            border: state.isFocused ? "2px solid green-700" : "",
            borderColor: state.isFocused ? "green-700" : "#e7e7e7",
            boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
            padding: "6px 6px",
            "&:hover": {
              borderColor: "green",
              boxShadow: "0 0 0 1px green",
              cursor: "pointer",
            },
          }),
        }}
        className="rounded-xl"
      />

      <h2 className="font-omnes text-2xl sm:text-[28px] text-theme-black-2 font-semibold">
        Select the city
      </h2>

      <Select
        value={country.cities}
        onChange={(selectedCity) =>
          setFormData({
            ...formData,
            cityId: selectedCity.value,
          })
        }
        options={cities}
        inputId="cities"
        placeholder="Select City"
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: "8px",
            border: state.isFocused ? "2px solid green-700" : "",
            borderColor: state.isFocused ? "green-700" : "#e7e7e7",
            boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
            padding: "6px 6px",
            "&:hover": {
              borderColor: "green",
              boxShadow: "0 0 0 1px green",
              cursor: "pointer",
            },
          }),
        }}
        className="rounded-xl"
      />
      <h2 className="font-omnes text-2xl sm:text-[28px] text-theme-black-2 font-semibold">
        Select the Zone
      </h2>

      <Select
        // value={getZone}
        onChange={handleZoneChange}
        options={getZone}
        inputId="zones"
        placeholder="Select Zone"
        styles={{
          control: (base, state) => ({
            ...base,
            borderRadius: "8px",
            border: state.isFocused ? "2px solid green-700" : "",
            borderColor: state.isFocused ? "green-700" : "#e7e7e7",
            boxShadow: state.isFocused ? "0 0 0 1px green" : "none",
            padding: "6px 6px",
            "&:hover": {
              borderColor: "green",
              boxShadow: "0 0 0 1px green",
              cursor: "pointer",
            },
          }),
        }}
        className="rounded-xl"
      />
      <p className="text-theme-black-2 font-light text-sm">
        Enter your address here and you will see the distance between your
        location and our hub or another point from which you can start.
      </p>

      {/* Google Map Section */}
      <div className="mt-10 flex flex-col lg:flex-row  lg:space-x-8 space-y-4">
        <div className="flex-1 h-[300px] relative rounded-lg overflow-hidden border">
          <GoogleMap
            zoom={14}
            center={mapCenter}
            mapContainerStyle={{
              width: "100%",
              height: "300px",
            }}
            options={{
              disableDefaultUI: true,
              draggable: true,
              scrollwheel: true,
              disableDoubleClickZoom: true,
              zoomControl: true,
            }}
          >
            <Marker position={mapCenter} />
          </GoogleMap>
        </div>
        <div className="flex-1">
          <h2 className="font-sf text-2xl font-semibold">
            <span className="text-theme-red-2"> Basel</span> is good choice!
          </h2>

          <div className="mt-8 flex items-center gap-x-4">
            <div className="w-6 h-6 rounded-full bg-theme-red-2 flex justify-center items-center gap-4">
              <IoHomeOutline color="white" size={16} />
            </div>
            <p>Start you shift from a hub</p>
          </div>
          <div className="mt-8 flex items-center gap-x-4">
            <div className="w-6 h-6 rounded-full bg-[#242E30] flex justify-center items-center gap-4">
              <GrMapLocation color="white" size={15} />
            </div>
            <p>Start you shift from a remote location</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;
