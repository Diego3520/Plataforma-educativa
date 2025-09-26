import { useState, useEffect } from 'react'


function App() {
    const [mensaje, setMensaje] = useState ("no mensaje")
    useEffect(() => {
        fetch("http://localhost:8000/api/hello")
            .then((response) => response.json())
            .then((data) => setMensaje(data.mensaje))
            .catch((error) => console.error("Error fetching data:", error));
    }, []);
  return (
    <>
        <p>{mensaje}</p>
    </>
  )
}

export default App
