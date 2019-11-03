const spawn = require('child_process').spawn;
const path = require('path');
const uniqueFilename = require('unique-filename');
const fs = require('fs');

//TLE condition in milliseconds
const TIMEOUT = 3000;

/*
returns a Promise that can be used as following:
judge(your_program, your_input)
  .then(function(data) {
    var stdout = data[0];
    var stderr = data[0];
  });
  
Assumes you have G++ installed and path variable is set.
*/

function judge(program, inputData) {
  var Rstdout = null, Rstderr = null;
  filename = uniqueFilename('.') + '.cpp';
  let promise = new Promise(function(resolve, reject) {
    fs.writeFile('./tmp/' + filename, program, function (err) {
      if (err)
        return console.log(err);
      
      //TODO: implement for supporting more languages.

      var compile = spawn('g++', ['-std=c++11', './tmp/' + filename, '-o', 'tmp/' + filename + '.out']);
      compile.stdout.on('data', function (data) {
        Rstdout = data;
      });
      compile.stderr.on('data', function (data) {
        Rstderr = String(data);
        if (!(Rstderr.length === 0))
          resolve([Rstdout, Rstderr]);
      });
      compile.on('close', function (data) {
        fs.access('./tmp/' + filename, function (err) {
          if (!err) {
            fs.unlink('./tmp/' + filename, function (err) {
              if (err)
                console.log(err);
            });
          } else {
            console.log(err);
          }
        });
        if (data === 0) {

          //execute the output file
          var run = spawn('./' + 'tmp/' + filename + '.out', []);
          run.stdin.write(inputData + '\n');
          
          //TLE
          var ok = setTimeout(
            function () {
              reject('TLE');
              run.kill()
            },
            TIMEOUT
          );

          run.stdout.on('data', function (data) {
            Rstdout = String(data);
            if (!(Rstdout.length === 0)) {
              resolve([Rstdout, Rstderr]);
              clearTimeout(ok);
            }
          });
          
          // run.stderr.on('data', function (data) {
          //   if (!(Rstderr.length === 0))
          //     resolve([Rstdout, Rstderr]);
          //     clearTimeout(ok);
          // });
          
          //delete the executable file
          fs.access('./tmp/' + filename + '.out', function (err) {
            if (!err) {
              fs.unlink('./tmp/' + filename + '.out', function (err) {
                if (err)
                  console.log(err);
              });
            } else {
              console.log(err);
            }
          });
        }
      });
    });
  });

  return promise
    .then(function(data) {
      return data;
    })
    .catch(function(data) {
      //TODO : figure out how this can be useful.
      return data;
    });
}

//test code below

// testCode = '#include <iostream>\nusing namespace std;int main(){cerr << "SHIT" << endl; string x;cin>>x;cout<<x<<endl;cout<<"hello World"<<endl;return 0;}';
// testInput = 'helloworld';


// judge(testCode, testInput)
//   .then(
//     function (response) {
//       console.log(response);
//     })
//   .catch(function(data) {
//     console.log(data);
//   });

module.exports = { judge };
