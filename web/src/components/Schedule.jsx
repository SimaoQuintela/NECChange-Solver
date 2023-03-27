import React from "react";
import { render } from "react-dom";
import events from "@/api/events";
import * as BigCalendar from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("en-GB");
BigCalendar.momentLocalizer(moment);

const allViews = Object.keys(BigCalendar.Views).map(
  (k) => BigCalendar.Views[k]
);

const App = () => (
  <div style={{ height: 700 }}>
    <BigCalendar
      events={events}
      step={60}
      views={allViews}
      defaultDate={new Date(2015, 3, 1)}
      popup={false}
      onShowMore={(events, date) => this.setState({ showModal: true, events })}
    />
  </div>
);

export default <App />;
