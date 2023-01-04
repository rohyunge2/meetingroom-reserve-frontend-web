import CalendarSelector from 'react-calendar';
import React, { useState } from 'react'
import 'react-calendar/dist/Calendar.css';

export default function SideBar(props) {

  const changeDate = (date) => {
    props.onChangeDate(date);
  }

  const onPopup = () => {
    window.open('intro', 'meetingReservationIntro', 'width=520px, height=400px')
  }

  return (
    <div className="sidebar">
        <CalendarSelector
          className="mb30 no-border"
          onChange={changeDate}
          value={props.today}
          calendarType="US"
          locale="en-US"
        />
        <div className="ml20">부서별 예약현황</div>
        <div className="mt10 mb10">
          <div className="ml20 mr10 mt5 float-left rectangle color-MD"></div>
          <span>MD</span>
        </div>
        <div className="mt10 mb10">
          <div className="ml20 mr10 mt5 float-left rectangle color-MAD"></div>
          <span>MAD</span>
        </div>
        <div className="mt10 mb10">
          <div className="ml20 mr10 mt5 float-left rectangle color-ITD"></div>
          <span>ITD</span>
        </div>
        <div className="mt10 mb10">
          <div className="ml20 mr10 mt5 float-left rectangle color-SSD"></div>
          <span>SSD</span>
        </div>
        <div className="mt10 mb10">
          <div className="ml20 mr10 mt5 float-left rectangle color-RD"></div>
          <span>RD</span>
        </div>
        <div className="mt10 mb10">
          <div className="ml20 mr10 mt5 float-left rectangle color-IDAM"></div>
          <span>IDAM</span>
        </div>
        {/* <div style={{display: "flex", justifyContent: "center"}}>
          <div className="mt10 text-center" style={{color: "#777",position: "fixed", bottom: "40px"}}><span className="pointer" onClick={onPopup}>회의실 캘린더 소개</span></div>
        </div> */}
    </div>
  );
}
  