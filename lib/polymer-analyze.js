var hyd  = require('hydrolysis'),
    fs   = require('fs'),
    path = require('path');

function analysePolymerJson(file){
  //Try and load the file
  try {
    stats = fs.accessSync(file,fs.R_OK);
    var json = require(file);
    var routesToAnalyse = [path.resolve(path.dirname(file),json.shell)];
    json.fragments.forEach(function(val){
      routesToAnalyse.push(path.resolve(path.dirname(file),val));
    });
    return analyseListOfFiles(routesToAnalyse);
  }
  catch (e) {
    return Promise.reject('Cannot read file ' + file);
  }
}

function analyseFile(file){
  //Try and load the file
  try {
    stats = fs.accessSync(file,fs.R_OK);
    var routesToAnalyse = [];
    return analyseListOfFiles([file]);
  }
  catch (e) {
    return Promise.reject('Cannot read file ' + file);
  }
}

function inDependencies(array,dep){
  for(var i = 0;i < array.length;i++){
    if(array[i] && array[i].file === dep){
      return i;
    }
  }
  return null;
}

function mergeDeps(obj,obj2){
  var final = {dependencies: []};
  obj.dependencies.forEach(function(val){
    addDependency(final,val.file,-1,val.refCount,val.depth);
  });
  obj2.dependencies.forEach(function(val){
    addDependency(final,val.file,-1,val.refCount,val.depth);
  });
  return final;
}

function addDependency(obj,dep,depth,refCount,depthArray){
  if(!obj.dependencies){
    obj.dependencies = [];
  }

  var index = inDependencies(obj.dependencies,dep);
  if(index !== null){
    obj.dependencies[index].refCount++;
    if(obj.dependencies[index].depth.indexOf(depth) === -1 && depth >= 0){
      obj.dependencies[index].depth.push(depth);
    }

    //Merge depth arrays
    if(depthArray){
      obj.dependencies[index].depth = Array.from(new Set(obj.dependencies[index].depth.concat(depthArray)));
    }
  }else{
    var stats = fs.statSync(dep);
    var bytes = stats['size'];
    obj.dependencies.push({
      file : dep,
      refCount : ((refCount) ? refCount : 1),
      size : bytes,
      depth : ((depthArray) ? depthArray : ((depth >= 0) ? [depth] : []))
    });
  }
}

function analyseListOfFiles(list){
  var routePromise = [];
  list.forEach(function(file) {
    routePromise.push(analyse({},file,0));
  });

  return Promise.all(routePromise);
}

//Analyse file and loop over dependencies
function analyse(obj,file,level){
  return new Promise(function(resolve, reject) {
    return hyd.Analyzer.analyze(file)
    .then(function(analyzer) {
      keys = [];
      for(var k in analyzer.html) keys.push(k);

      if(analyzer.html[keys[0]].depHrefs.length > 0){
        analyzer.html[keys[0]].depHrefs.forEach(function(dep) {
          addDependency(obj,dep,level)
        });
      }else{
        obj.dependencies = [];
      }
      //console.log('Analysed file : '+file);
      //console.log(require('util').inspect(obj, true, 10));
      resolve(obj);
    }).catch(function(reason){
        console.error("Error");
        console.error(reason);
    });
  }).then(function(obj){

    if(obj.dependencies.length > 0){
      var routePromise = [];
      obj.dependencies.forEach(function(file){
        routePromise.push(analyse({},file.file,level+1));
      });
      return Promise.all(routePromise).then(function(val) {
        val.forEach(function(val2){
          obj = mergeDeps(obj,val2);
        });
        if(level === 0){
          obj.file = file;
        }
        return obj;
      }).catch(function(reason) {
        console.error("Error");
        console.error(reason);
      });
    }else{
      //console.log('No more dependencies');
      if(level === 0){
        obj.file = file;
      }
      return obj;
    }

  }).catch(function(reason){
    console.error("Error");
    console.error(reason);
  });
}

function exportManifest(file,analysis){
  var promiseArray = [];
  for(var i = 0;i < analysis.length;i++){
    promiseArray.push(new Promise(function(resolve, reject) {
      var fileout = path.resolve(path.dirname(file),'push_manifest_'+i+'.json');
      var manifest = {};
      analysis[i].dependencies.forEach(function(value){
        manifest[value.file.replace(path.dirname(file),'')] = {
          type : 'document',
          weight : value.refCount + value.depth.length
        }
      });
      fs.writeFile(fileout, JSON.stringify(manifest), function(err) {
        if(err){
          reject(fileout);
        }else{
          resolve(fileout);
        }
      });
    }));
  }
  return Promise.all(promiseArray);
}

exports.analyse = analysePolymerJson;
exports.analyseFile = analyseFile;
exports.exportManifest = exportManifest;
