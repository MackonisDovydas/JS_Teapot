
var effectController;
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 10000 );
var orbitFree = new THREE.OrbitControls( camera, renderer.domElement );
orbitFree.enableZoom = true;
var dLight = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
scene.add(dLight);
setupGui();



camera.position.set(0,200,-200);
scene.add(camera);



var ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
ambientLight.position.set(100,50,100);
scene.add( ambientLight );
function setupGui() {

            effectController = {

                    shininess: 40.0,
                    ka: 0.17,
                    kd: 0.51,
                    ks: 0.2,
                    metallic: true,

                    hue:		0.121,
                    saturation: 0.73,
                    lightness:  0.66,

                    lhue:		 0.04,
                    lsaturation: 0.01,
                    llightness:  1.0,

                    lx: 0.32,
                    ly: 0.39,
                    lz: 0.3,
                    newTess: 8,
                    bottom: true,
                    lid: true,
                    body: true,
                    fitLid: true,
                    nonblinn: false,
                    newShading: "glossy",
                    
                    scale:4.0,
                    edge:0.0
                    
                    
            };

            var h;

            var gui = new dat.GUI();

            h = gui.addFolder( "Light direction" );

            h.add( effectController, "lx", -1.0, 1.0, 0.025 ).name( "x" ).onChange( update );
            h.add( effectController, "ly", -1.0, 1.0, 0.025 ).name( "y" ).onChange( update );
            h.add( effectController, "lz", -1.0, 1.0, 0.025 ).name( "z" ).onChange( update );
            gui.add(effectController,"scale",4.0,20.0,1).name("scale").onChange(update);
            gui.add(effectController,"edge",0.0,10.0,0.5).name("edge").onChange(update);
            
    }





function v2(p1,p2){
    return new THREE.Vector2(p1,p2);
}
var walker;



var materialColor = new THREE.MeshPhongMaterial( { color: 0xffffFF, wireframe:false, polygonOffset: true} );


var tilingMaterial = new THREE.ShaderMaterial( {
    uniforms: THREE.UniformsUtils.merge([
        
        THREE.UniformsLib['lights'],{
        "color1" : {
            type : "c",
            value : new THREE.Color(0xff00ff)
        },
        "color2" : {
            type : "c",
            value : new THREE.Color(0x0307fc) 
        },
        "color3" : {
            type : "c",
            value : new THREE.Color(0x6be817)
        },
        "color4" : {
            type : "c",
            value : new THREE.Color(0xf5f105)
        },
            uScale: {type: 'f', value: 8.0},
            uEdge: {type: 'f', value:  0.0} 
			
    }]),
        vertexShader: document.getElementById( 'vertexShader').textContent,
        fragmentShader: document.getElementById( 'fragmentShader').textContent ,
        lights: true
    } );


var teapotSize = 50;
var tess  = effectController.newTess;
var teapotGeometry = new THREE.TeapotGeometry( teapotSize,
					effectController.newTess,
					effectController.bottom,
					effectController.lid,
					effectController.body,
					effectController.fitLid,
					! effectController.nonblinn );
				teapot = new THREE.Mesh(teapotGeometry,[materialColor,tilingMaterial,materialColor]);
				scene.add( teapot );
                                walker = teapot;

teapot.position.y = teapotSize;
var stripStart = 0.3;
stripStart = stripStart * (teapotSize/2);
var stripSize = 5;
var stripMeasurePoint = teapot.position.clone();


for(f = 0; f < teapotGeometry.faces.length; f++){
    var face = teapotGeometry.faces[f];
    var vert = [teapotGeometry.vertices[face.a],teapotGeometry.vertices[face.b],teapotGeometry.vertices[face.c]];
    vert.sort(function (a,b){
        if(a.y < b.y){
            return -1;
        }
        else{
            return 1;
        }
    });
    
    var high = vert[0];
    var low = vert[2];
    stripMeasurePoint.y = low.y;
    if(low.y >stripStart && high.y < stripStart + stripSize){
        if(low.distanceTo(stripMeasurePoint) < teapotSize +10){
            face.materialIndex = 1;
        }
    }
}


function update(){
    

    orbitFree.target.set(walker.position.x,walker.position.y,walker.position.z);
    
    dLight.position.set( effectController.lx, effectController.ly, effectController.lz );
    dLight.color.setHSL( effectController.lhue, effectController.lsaturation, effectController.llightness );
    ambientLight.color.setHSL( effectController.hue, effectController.saturation, effectController.lightness * effectController.ka );
    tilingMaterial.uniforms.uScale.value = effectController.scale;
    tilingMaterial.uniforms.uEdge.value = effectController.edge; 
}
function getSelectedCamera(){
    return camera;
}


window.addEventListener( 'resize', function () {

    var w = window.innerWidth;
    var h =window.innerHeight;
    
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    renderer.setSize( w, h );

}, false );

function animate() {
    update();
    renderer.render( scene, getSelectedCamera() );
    requestAnimationFrame( animate );
}

animate();