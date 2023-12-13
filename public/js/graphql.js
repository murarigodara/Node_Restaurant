window.onload=()=>{

    let btn=document.getElementById('btn');
    btn.addEventListener('click',showData);

    function showData(){
       
        let name=document.getElementById('name').value;
        if(name!=''){
            fetch(`http://localhost:8000/graphql?query=query { restaurantByName(name: "${name}") { _id name borough cuisine grades { date grade score } } }`)
            .then(response => {
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              return response.text();
            })
            .then(data => {
              let rows=JSON.parse(data)["data"]['restaurantByName'];
              let table=`<table>
               <thead><tr>
               <th>Name</th>
               <th>Cuisie</th</tr><tbody>`;
              rows.forEach(element => {
                  table+=`<tr><td>${element.name}</td><td>${element.cuisine}</td></tr>`
              });
              table+=`</tbody></table>`;
              document.getElementById('graphResult').innerHTML=table;
            })
            .catch(error => {
              console.error('Error during fetch operation:', error.message);
            });
        }
       
    }
}




