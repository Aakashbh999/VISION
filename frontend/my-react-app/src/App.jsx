import React from "react";
import Hello from "./components/hello";
import Hi from "./components/hi";
function App() {
  function displayWow() {
    return <h3>Sandesh nonchalant!</h3>;
  }
  const arry = ["mehtab ", "sandesh ", "aakash ", "Noob "];
  return (
    <div>
      <div class="text-center pt-4">
        <Hello> </Hello>
        <Hi></Hi>
        <h1 class=" inline font-bold text-5xl text-center  bg-linear-to-r from-blue-500 via-yellow-500 to-red-500 text-transparent bg-clip-text  ">
          Welcome, Developer!
        </h1>
        <h2>Display Arrys.... </h2>
      </div>
      {arry.map((item, i) => (
        <div>
          <h1>{item}</h1>
          <p>{i}</p>
        </div>
      ))}
    </div>
  );
}

export default App;
