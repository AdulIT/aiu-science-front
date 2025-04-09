import React, { useState } from "react";
import { publicationTypeMap } from "../../pages/PublicationPage/PublicationsPage";
import { allHigherSchools } from "../../pages/AdminPublications";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";

export default function PublicationComponents({
  setYear,
  setName,
  type,
  setType,
  school,
  setSchool,
}) {
  const [preyear, setPreyear] = useState(null);
  const [prename, setPrename] = useState(null);
  return (
    <div className="flex flex-row gap-2">
      {/* <input
        type="text"
        onChange={(e) => setPrename(e.target.value)}
        value={prename}
      ></input> */}

      <input
        type="text"
        onChange={(e) => setPreyear(e.target.value)}
        value={preyear}
      ></input>
      <button
        className="border rounded bg-blue-100 text-blue-500"
        onClick={() => {
          setYear(preyear);
        //   setName(prename);
        }}
      >
        find
      </button>

      <Listbox value={type} onChange={setType}>
        <ListboxButton className="w-72 border border-gray-200 bg-white text-left   px-4 py-2 cursor-pointer">
          {type ? publicationTypeMap[type] : "All"}
        </ListboxButton>
        <ListboxOptions anchor="bottom ">
          <ListboxOption value={null} className="bg-white border w-72 ">
            All
          </ListboxOption>
          {Object.entries(publicationTypeMap).map(([value, label]) => (
            <ListboxOption
              key={value}
              value={value}
              className="bg-white border w-72 "
            >
              {label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
      <Listbox value={school} onChange={setSchool}>
        <ListboxButton className="w-72 border border-gray-200 bg-white text-left   px-4 py-2 cursor-pointer">
          {school ? school : "All"}
        </ListboxButton>
        <ListboxOptions anchor="bottom ">
          <ListboxOption value={null} className="bg-white border w-72 ">
            All
          </ListboxOption>
          {allHigherSchools.map((school, i) => (
            <ListboxOption
              key={i}
              value={school}
              className="bg-white border w-72 "
            >
              {school}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
}
