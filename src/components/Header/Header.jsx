import { MdLocationOn } from "react-icons/md";
import {
  HiCalendar,
  HiLogout,
  HiMinus,
  HiPlus,
  HiSearch,
} from "react-icons/hi";
import { useRef, useState } from "react";
import useOutsideClick from "../../hooks/useOutsideClick";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { DateRange } from "react-date-range";
import { format } from "date-fns";
import {
  createSearchParams,
  NavLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function Header() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [openOptions, setOpnOptions] = useState(false);
  const [options, setOptions] = useState({
    Adult: 1,
    children: 0,
    room: 1,
  });
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);
  const [openDate, setOpenDate] = useState(false);
  const navigate = useNavigate();

  const dateRef = useRef();
  useOutsideClick(dateRef, "dateRange", () => setOpenDate(false));

  const handleOptions = (name, operation) => {
    setOptions((prev) => {
      return {
        ...prev,
        [name]: operation === "inc" ? options[name] + 1 : options[name] - 1,
      };
    });
  };

  const handleSearch = () => {
    const encodedParams = createSearchParams({
      date: JSON.stringify(date),
      options: JSON.stringify(options),
      destination,
    });
    // setSearchParams(encodedParams); // update and show search detail in current url
    navigate({
      pathname: "/hotels",
      search: encodedParams.toString(),
    });
  };

  return (
    <div>
      <div className="header">
        <NavLink to="bookmark">Bookmark</NavLink>
        <div className="headerSearch">
          <div className="headerSearchItem">
            <MdLocationOn className="headerIcon locationIcon" />
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="headerSearchInput"
              placeholder="Where to go?"
              type="text"
              name="destination"
              id="destination"
            />
            <div className="separator"></div>
          </div>
          <div className="headerSearchItem">
            <HiCalendar className="headerIcon dateIcon" />
            <div
              className="dateDropDown"
              onClick={() => setOpenDate(!openDate)}
              id="dateRange"
            >
              {`${format(date[0].startDate, "MM/dd/yyyy")} to ${format(
                date[0].endDate,
                "MM/dd/yyyy"
              )}`}
            </div>
            {openDate && (
              <div ref={dateRef}>
                <DateRange
                  onChange={(item) => setDate([item.selection])}
                  ranges={date}
                  minDate={new Date()}
                  moveRangeOnFirstSelection={true}
                  className="date"
                />
              </div>
            )}
            <div className="separator"></div>
          </div>
          <div className="headerSearchItem">
            <div
              id="optionDropDown"
              onClick={() => setOpnOptions(!openOptions)}
            >
              {options.Adult} Adult &bull; {options.children} children
              &bull;&nbsp;
              {options.room} room
            </div>
            {openOptions && (
              <GuestOptionList
                handleOptions={handleOptions}
                options={options}
                setOpnOptions={setOpnOptions}
              />
            )}
            <div className="separator"></div>
          </div>
          <div className="headerSearchItem">
            <button className="headerSearchBtn" onClick={handleSearch}>
              <HiSearch className="headerIcon" />
            </button>
          </div>
        </div>
        <User />
      </div>
    </div>
  );
}

export default Header;

function GuestOptionList({ options, handleOptions, setOpnOptions }) {
  const optionsRef = useRef();
  useOutsideClick(optionsRef, "optionDropDown", () => setOpnOptions(false));

  const optionItems = [
    { type: "Adult", minLimit: 1 },
    { type: "children", minLimit: 0 },
    { type: "room", minLimit: 1 },
  ];

  return (
    <div className="guestOptions" ref={optionsRef}>
      {/* <OptionItem
        handleOptions={handleOptions}
        type="Adult"
        options={options}
        minLimit={1}
      />
      <OptionItem
        handleOptions={handleOptions}
        type="children"
        options={options}
        minLimit={0}
      />
      <OptionItem
        handleOptions={handleOptions}
        type="room"
        options={options}
        minLimit={1}
      /> */}
      {optionItems.map((item, index) => (
        <OptionItem
          key={index}
          handleOptions={handleOptions}
          type={item.type}
          options={options}
          minLimit={item.minLimit}
        />
      ))}
    </div>
  );
}

function OptionItem({ options, type, minLimit, handleOptions }) {
  return (
    <div className="guestOptionItem">
      <span className="optionText">{type}</span>
      <div className="optionCounter">
        <button
          onClick={() => handleOptions(type, "dec")}
          className="optionCounterBtn"
          disabled={options[type] <= minLimit}
        >
          <HiMinus className="icon" />
        </button>
        <span className="optionCounterNumber">{options[type]}</span>
        <button
          onClick={() => handleOptions(type, "inc")}
          className="optionCounterBtn"
        >
          <HiPlus className="icon" />
        </button>
      </div>
    </div>
  );
}

function User() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <span>{user.name}</span>
          <button>
            <HiLogout onClick={handleLogout} className="icon" />
          </button>
        </div>
      ) : (
        <NavLink to="login">login</NavLink>
      )}
    </div>
  );
}
