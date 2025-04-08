import {
  Streamlit,
  StreamlitComponentBase,
  withStreamlitConnection,
} from "streamlit-component-lib"
import React, { ReactNode } from "react"
import Plot from 'react-plotly.js';

const decodeData = (data: any) => {
  if (data && data.bdata) {
    // Decode Base64 and convert to a typed array
    const binaryString = atob(data.bdata);
    const byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      byteArray[i] = binaryString.charCodeAt(i);
    }
    return Array.from(byteArray);
  }
  return data;
};

class StreamlitPlotlyEventsComponent extends StreamlitComponentBase {
  public render = (): ReactNode => {
    // Pull Plotly object from args and parse
    // print args to console
    console.log(this.props.args);
    // console.log(this.props.args["plot_obj"]);
    // print plot_obj to console
    // console.log(JSON.parse(this.props.args["plot_obj"]));
    // print click_event to console
    // console.log(this.props.args["click_event"]);
    // console.log(this.props.args["select_event"]);
    // console.log(this.props.args["hover_event"]);

    const plot_obj = JSON.parse(this.props.args["plot_obj"]);

    // Decode x and y data
    plot_obj.data = plot_obj.data.map((trace: any) => {
      if (trace.x && trace.x.bdata) {
        trace.x = decodeData(trace.x);
      }
      if (trace.y && trace.y.bdata) {
        trace.y = decodeData(trace.y);
      }
      return trace;
    });

    const override_height = this.props.args["override_height"];
    console.log(`override_height ${override_height}`);
    const override_width = this.props.args["override_width"];
    console.log(`override_width ${override_width}`);

    // Event booleans
    const click_event = this.props.args["click_event"];
    const select_event = this.props.args["select_event"];
    const hover_event = this.props.args["hover_event"];

    Streamlit.setFrameHeight(override_height);
    return (
      <Plot
        data={plot_obj.data}
        layout={plot_obj.layout}
        config={plot_obj.config}
        frames={plot_obj.frames}
        onClick={click_event ? this.plotlyEventHandler : function(){}}
        onSelected={select_event ? this.plotlyEventHandler : function(){}}
        onHover={hover_event ? this.plotlyEventHandler : function(){}}
        style={{width: override_width, height: override_height}}
        className="stPlotlyChart"
      />
    )
  }

  /** Click handler for plot. */
  private plotlyEventHandler = (data: any) => {
    // Build array of points to return
    var clickedPoints: Array<any> = [];
    data.points.forEach(function (arrayItem: any) {
      clickedPoints.push({
        x: arrayItem.x,
        y: arrayItem.y,
        curveNumber: arrayItem.curveNumber,
        pointNumber: arrayItem.pointNumber,
        pointIndex: arrayItem.pointIndex
      })
    });

    // Return array as JSON to Streamlit
    Streamlit.setComponentValue(JSON.stringify(clickedPoints))
  }
}

export default withStreamlitConnection(StreamlitPlotlyEventsComponent)
