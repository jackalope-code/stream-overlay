// import styled from 'styled-components';

// const Input = styled.input(props => {
//   return `
//     width: 15ch;
// `});

export default function WidgetFieldForm() {
  // const formStyling: React.CSSProperties = {
  //   "form input"
  //   width: "15ch"
  // }
  return (
    <div >
      <form style={{display: "flex", flexDirection: "row", columnGap: "10px"}}>
        <label>
          URL:
          <span>url goes here</span>
        </label>
        <label>
          X:
          <input type="text" value="x" />
        </label>
        <label>
          Y:
          <input type="text" value="y" />
        </label>
        <label>
          Width:
          <input type="text" value="width" />
        </label>
        <label>
          Height:
          <input type="text" value="height" />
        </label>
        <label>
          Visible:
          <input type="toggle" value="visible" />
        </label>
        <input type="submit" value="submit" onSubmit={(e) => e.preventDefault()}/>
      </form>
    </div>
  )
}