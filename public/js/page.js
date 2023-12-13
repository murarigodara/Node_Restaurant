
window.onload=()=>{
    document.querySelectorAll('.sort').forEach(button => {
        button.addEventListener('click', function() {
          // Retrieve the column name from the data-column attribute
          var columnName = this.getAttribute('data-column');
          sortData(columnName);
        });
      })
    //var x=50; to be deleted
//   document.getElementById('sortBy').addEventListener('change', sortData);
    //  document.getElementsByClassName('sort').addEventListener('click',sortData)
  function sortData(key){

    console.log(key)
      
    //   let key=document.getElementById('sortBy').value;
     
      if(key){
       
          const table = document.getElementById('dataTable');
          
          const tbody = table.getElementsByTagName('tbody')[0];
          var buttons = document.querySelectorAll('.sort');
        //   const thead = table.querySelectorAll('sort');
          console.log(buttons[0].getAttribute('data-column'));
          const headings = Array.from(buttons).map(th => th.getAttribute('data-column'));
          
          let columnIndex=headings.indexOf(String(key));
          console.log(columnIndex)
          const rows = Array.from(tbody.getElementsByTagName('tr'));
         
          rows.sort((a, b) => {
             
              let aValue = a.getElementsByTagName('td')[columnIndex].innerText;
              
              let bValue = b.getElementsByTagName('td')[columnIndex].innerText;
              
              if(!Number.isNaN(Number(aValue))&& !Number.isNaN(Number(bValue) )){
                console.log("number is hit")
                return parseFloat(aValue)-parseFloat(bValue);
              }
  
              return aValue.localeCompare(bValue);
            });
            // Remove existing rows from the table
            while (tbody.firstChild) {
              tbody.removeChild(tbody.firstChild);
            }
            // Append the sorted rows back to the table
            rows.forEach(row => tbody.appendChild(row));
      }
  }
  }


// $(document).ready(function () {
    function showGradeModal(temp) {
        
        let id=temp.dataset.id;
        $.ajax({
            url: `http://localhost:8000/api/restaurant/${id}`, // Replace with your actual API endpoint
            type: 'GET',
            success: function (data) {   
                grades=data[0].grades
                let gradeTable=getTable(grades)
                $('#gradeModal .modal-body').html(gradeTable);
       
                $('#gradeModal').modal('show');
               

            },
            error: function (error) {
                console.error('Error fetching grades:', error);
                // Handle error if needed
            }
        });


      
      }


function getTable(grades){
    let tableGrade=`<table class="table">
    <thead>
      <tr>
        <th scope="col">Score</th>
        <th scope="col">Grade</th>
        <th scope="col">Date</th>
      </tr>
    </thead>
    <tbody>`;
    grades.forEach(function (grade) {
                       var row = `<tr><td>${grade.grade}</td><td>${grade.score}</td><td>${grade.date}</td></tr>`;
                       tableGrade+=row;
                    });

    tableGrade+='</tbody></table>';
   return tableGrade;


}

