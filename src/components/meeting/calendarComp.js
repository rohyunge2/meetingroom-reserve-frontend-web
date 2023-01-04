import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from 'moment-timezone';

import Calendar from "@toast-ui/react-calendar";
import "tui-calendar/dist/tui-calendar.css";
import ReactLoading from 'react-loading';

// If you use the default popups, use this.
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";

import SideBar from "../layout/sideBar";
import Header from "../layout/header";
import myTheme from "./calendarTheme";
import * as config from '../../config';

export default function CalendarComp(props) {
  // State 생성
  const [inputs, setInputs] = useState({
    today: new Date(),
    schedule: [],
    refresh: false,
  });
  
  const calendarRef = React.createRef();
  const loadingRef = React.useRef();
  const scheduleArr = [];

  // 최초 세팅
  useEffect(() => {
    // getList();
    
  }, []);
  
  // 날짜 변경 콜백
  useEffect(() => {
    
    const calendarInstance = calendarRef.current.getInstance();
    calendarInstance.setDate(inputs.today);

    axios
    .get(config.API_URL + "/reserve")
    .then((response) => {
      const data = response.data.reserves;
      const keys = Object.keys(data);
      
      if ( keys.length > 0 ){
        keys.forEach(key => {
          const val = data[key];
          
          scheduleArr.push({
            id: val.reserve_id,
            calendarId: val.meeting_department_code,
            title: val.meeting_content,
            userName: val.reserve_user_name,
            place: val.meeting_place_code,
            gubun: val.gubun,
            category: "time",
            start: new Date(val.meeting_start_time).toString(),
            end: new Date(val.meeting_end_time).toString(),
          })
        });
        
        scrollDown();
        calendarInstance.createSchedules(scheduleArr);
      }
    })

  }, [inputs.today, inputs.refresh]);

  const getDate = (unit, date, num, symbol) => {
    let todayDate = new Date(date);

    if (symbol == "-") {
      num = -num;
    }

    switch (unit) {
      case "date":
        todayDate.setDate(todayDate.getDate() + num);
        break;

      case "hours":
        todayDate.setHours(todayDate.getHours() + num);
        break;

      case "minutes":
        todayDate.setMinutes(todayDate.getMinutes() + num);
        break;
    }

    return todayDate;
  };

  const openCreationPopup = () => {

    const calendarInstance = calendarRef.current.getInstance();
    const today = new Date().getFullYear() + "-" + (new Date().getMonth()+1) + "-" + new Date().getDate();

    calendarInstance.openCreationPopup([]);

  }

  const changeToday = (date) => {
    setInputs({
      ...inputs,
      today: date
    })
  }

  const goToday = () => {
    const calendarInstance = calendarRef.current.getInstance();
    calendarInstance.today();
    setInputs({
      ...inputs,
      today: new Date()
    })
  };

  const goNextWeek = () => {
    const calendarInstance = calendarRef.current.getInstance();
    calendarInstance.next();
    setInputs({
      ...inputs,
      today: getDate('date', inputs.today, 7, '+')
    })
  };

  const goPrevWeek = () => {
    const calendarInstance = calendarRef.current.getInstance();
    calendarInstance.prev();
    setInputs({
      ...inputs,
      today: getDate('date', inputs.today, 7, '-')
    })
  };

  const isNull = (val) => {
    if ( val == "" || val == null || val == undefined ){
      return true;
    }
    return false;
  }

  const showLoading = () => {
    loadingRef.current.style.display = "flex";
  }

  const hideLoading = () => {
    loadingRef.current.style.display = "none";
  }

  const scrollDown = () => {
    if ( document.querySelector(".tui-full-calendar-timegrid-container") ) {
      document.querySelector(".tui-full-calendar-timegrid-container").scrollTop = 100000;
    }
  }
  scrollDown();

  const createSchedules = (event) => {
    const calendarInstance = calendarRef.current.getInstance();
    
    const formData = new FormData();
    formData.append("meetingStartTime", getTimeStamp(event.start));
    formData.append("meetingEndTime", getTimeStamp(event.end));
    formData.append("meetingPlaceCode", event.place);
    formData.append("meetingDepartmentCode", event.calendarId);
    formData.append("reserveUserName", event.userName);
    formData.append("meetingContent", event.title);
    formData.append("gubun", event.gubun);

    showLoading();
    axios
      .post(config.API_URL + "/reserve", formData)
      .then((response) => {
        if ( response.data.message == "Fail"){
          alert("이미 예약완료 된 회의가 있습니다.\n다른 시간을 선택해주세요.");
        } else {
          const res = response.data;
          var schedule = {
            id: res.reserveId,
            calendarId: res.meetingDepartmentCode,
            title: res.meetingContent,
            userName: res.reserveUserName,
            place: res.meetingPlaceCode,
            category: "time",
            start: new Date(res.meetingStartTime).toString(),
            end: new Date(res.meetingEndTime).toString(),
          };
          
          calendarInstance.createSchedules([schedule]);
          alert("예약이 완료되었습니다.");
        }
      })
      .catch((error) => {
        axiosError(error);
      }).finally(()=>{
        hideLoading();
      })
      
  };

  function fillZeros(n, digits) {  
      var zero = '';  
      n = n.toString();  

      if (n.length < digits) {  
          for (var i = 0; i < digits - n.length; i++)  
              zero += '0';  
      }  
      return zero + n;  
  }  
    
  function getTimeStamp(date) {  
      var d = new Date(date);  

      var s = fillZeros(d.getFullYear(), 4) + '-' +  
              fillZeros(d.getMonth() + 1, 2) + '-' +  
              fillZeros(d.getDate(), 2) + ' ' +  
        
              fillZeros(d.getHours(), 2) + ':' +  
              fillZeros(d.getMinutes(), 2) + ':' +  
              fillZeros(d.getSeconds(), 2);  

      return s;  
  }  


  const updateSchedule = (event) => {
    const calendarInstance = calendarRef.current.getInstance();

    const meetingStartTime = event.changes && event.changes.start ? event.changes.start : event.schedule.start;
    const meetingEndTime = event.changes && event.changes.end ? event.changes.end : event.schedule.end;

    const formData = new FormData();
    // formData.append("reserveId", event.schedule.id);
    formData.append("meetingStartTime", getTimeStamp(meetingStartTime));
    formData.append("meetingEndTime", getTimeStamp(meetingEndTime));
    formData.append("meetingPlaceCode", event.changes && event.changes.place ? event.changes.place : event.schedule.place);
    formData.append("meetingDepartmentCode", event.changes && event.changes.calendarId ? event.changes.calendarId : event.schedule.calendarId);
    formData.append("reserveUserName", event.changes && event.changes.userName ? event.changes.userName : event.schedule.userName);
    formData.append("meetingContent",event.changes &&  event.changes.title ? event.changes.title : event.schedule.title);
    formData.append("gubun",event.changes &&  event.changes.gubun ? event.changes.gubun : event.schedule.gubun);
    
    showLoading();
    axios
      .put(config.API_URL + "/reserve/" + event.schedule.id , formData)
      .then((response) => {
        if ( response.data.message == "Fail"){
          alert("선택한 시간에 이미 예약완료 된 회의가 있습니다.\n예약한 담당자와 협의해주세요.");
        } else {
          calendarInstance.updateSchedule(event.schedule.id, event.schedule.calendarId, event.changes);
          refresh();
          alert("예약수정이 완료되었습니다.");
        }
      })
      .catch((error) => {
        axiosError(error);
      }).finally(()=>{
        hideLoading();
      });

  };

  const deleteSchedule = (event) => {
    if ( !window.confirm("예약취소 하시면 복구가 불가합니다.\n그래도 예약을 취소하시겠습니까?") ){
      return;
    }

    const calendarInstance = calendarRef.current.getInstance();

    showLoading();
    axios
      .delete(config.API_URL + "/reserve/"+ event.schedule.id)
      .then((response) => {
        console.log(response)
        calendarInstance.deleteSchedule(event.schedule.id, event.schedule.calendarId);
      })
      .catch((error) => {
        axiosError(error);
      })
      .finally(()=>{
        hideLoading();
      })
      ;
      
  };

  const axiosError = (error) => {
    if (error.response) {
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
  };

  const refresh = () => {
    setInputs({...inputs, refresh: !inputs.refresh});
  }

  const loading = () => {
      return (
        <div className="loading" style={{display:"none"}} ref={loadingRef}>
          <ReactLoading type={"spokes"} color="#222" />
        </div>
      )
  }
  
  const MyComponent = () => (
    <Calendar
      ref={calendarRef}
      usageStatistics={false}
      theme={myTheme}
      height="1325px"
      calendars={[
        {
          id: "None",
          name: "부서선택",
          bgColor: "#555",
          borderColor: "#555",
          dragBgColor: '#555',
        },
        {
          id: "MD",
          name: "MD",
          bgColor: "#42a5f5",
          borderColor: "#42a5f5",
          dragBgColor: '#42a5f5',
        },
        {
          id: "MAD",
          name: "MAD",
          bgColor: "#ab47bc",
          borderColor: "#ab47bc",
          dragBgColor: '#ab47bc',
        },
        {
          id: "ITD",
          name: "ITD",
          bgColor: "#ff7043",
          borderColor: "#ff7043",
          dragBgColor: '#ff7043',
        },
        {
          id: "SSD",
          name: "SSD",
          bgColor: "#26a69a",
          borderColor: "#26a69a",
          dragBgColor: '#26a69a',
        },
        {
          id: "RD",
          name: "RD",
          bgColor: "#5c6bc0",
          borderColor: "#5c6bc0",
          dragBgColor: '#5c6bc0',
        },
        {
          id: "IDAM",
          name: "IDAM",
          bgColor: "#ec407a",
          borderColor: "#ec407a",
          dragBgColor: '#ec407a',
        },
      ]}
      taskView={false}
      disableDblClick={true}
      disableClick={false}
      isReadOnly={false}
      month={{
        startDayOfWeek: 0,
      }}
      schedules={inputs.schedule}
      timezones={[
        {
          displayLabel: 'GMT+09:00',
          tooltip: 'Seoul'
        }
      ]}
      useDetailPopup={true}
      useCreationPopup={true}
      week={{
        showTimezoneCollapseButton: false,
        timezonesCollapsed: false,
        hourEnd:20,
        narrowWeekend: true
      }}
      onAfterRenderSchedule={scrollDown}
      onBeforeCreateSchedule={createSchedules}
      onBeforeUpdateSchedule={updateSchedule}
      onBeforeDeleteSchedule={deleteSchedule}
    />
  );

  return (
    <div>
      <Header openCreationPopup={openCreationPopup}/>
      <div>
        <SideBar today={inputs.today} onChangeDate={changeToday}/>
        <div className="mainComponent">
          <div className="weekNavigator">
            <div className="text-center weekNavigator-month">
              <span className="weekNavigatorText">{inputs.today.getFullYear()}년 {inputs.today.getMonth()+1}월</span>
              <img src="images/btn_nextweek@3x.png" className="btn-nextWeek pointer" onClick={goNextWeek}  />
              <img src="images/btn_preweek@3x.png" className="btn-prevWeek pointer" onClick={goPrevWeek} />
              <img src="images/btn_today@3x.png" className="btn-today pointer" onClick={goToday} />
            </div>
          </div>
          <MyComponent></MyComponent>
        </div>
      </div>
      {loading()}
    </div>
  );
} 