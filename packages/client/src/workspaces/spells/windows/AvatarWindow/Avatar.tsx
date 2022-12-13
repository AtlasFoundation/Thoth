// i really dont like this.  But three vrm, is super grumpy/.
// @ts-nocheck
import React, { Suspense, useEffect, useRef, useState } from 'react'
import * as ReactDOM from 'react-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMSchema, VRMUtils } from '@pixiv/three-vrm'
import { Object3D } from 'three'
import { useControls } from 'leva'
import { FaSortNumericDown } from 'react-icons/fa'
/*

inspired by https://twitter.com/yeemachine/status/1414993821583118341

*/

function randomsomesuch() {
  return (Math.random() - 0.5) / 10
}

const Avatar = ({ speechUrl }) => {
  const { scene, camera } = useThree()
  const gltf = useGLTF(
    `${process.env.REACT_APP_FILE_SERVER_URL}/files/VU-VRM-elf.vrm`
  )

  // settings
  const talktime = true
  let mouththreshold = 10
  let mouthboost = 10
  let bodythreshold = 10
  let bodymotion = 10
  let expression = 80
  let expressionyay = 0
  let expressionoof = 0
  let expressionlimityay = 0.5
  let expressionlimitoof = 0.5
  let expressionease = 100
  let expressionintensity = 0.75

  const avatar = useRef<VRM>()
  const [bonesStore, setBones] = useState<{ [part: string]: Object3D }>({})

  useEffect(() => {
    if (gltf) {
      // @ts-ignore
      VRMUtils.removeUnnecessaryJoints(gltf.scene)
      VRM.from(gltf as unknown as GLTF).then(vrm => {
        camera.position.set(0.0, 1.45, 0.4)
        avatar.current = vrm
        vrm.lookAt.target = camera

        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips).rotation.y =
          Math.PI
        vrm.springBoneManager.reset()

        // un-T-pose
        vrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.RightUpperArm
        ).rotation.z = 250

        vrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.RightLowerArm
        ).rotation.z = -0.2

        vrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftUpperArm
        ).rotation.z = -250

        vrm.humanoid.getBoneNode(
          VRMSchema.HumanoidBoneName.LeftLowerArm
        ).rotation.z = 0.2

        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.x =
          randomsomesuch()
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.y =
          randomsomesuch()
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Head).rotation.z =
          randomsomesuch()

        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.x =
          randomsomesuch()
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.y =
          randomsomesuch()
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck).rotation.z =
          randomsomesuch()

        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Spine).rotation.x =
          randomsomesuch()
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Spine).rotation.y =
          randomsomesuch()
        vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Spine).rotation.z =
          randomsomesuch()

        vrm.springBoneManager.reset()

        const bones = {
          neck: vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Neck),
          hips: vrm.humanoid.getBoneNode(VRMSchema.HumanoidBoneName.Hips),
          LeftShoulder: vrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.LeftShoulder
          ),
          RightShoulder: vrm.humanoid.getBoneNode(
            VRMSchema.HumanoidBoneName.RightShoulder
          ),
        }

        function blink() {
          var blinktimeout = Math.floor(Math.random() * 250) + 50

          setTimeout(() => {
            vrm.blendShapeProxy.setValue(
              VRMSchema.BlendShapePresetName.BlinkL,
              0
            )
            vrm.blendShapeProxy.setValue(
              VRMSchema.BlendShapePresetName.BlinkR,
              0
            )
          }, blinktimeout)

          vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.BlinkL, 1)
          vrm.blendShapeProxy.setValue(VRMSchema.BlendShapePresetName.BlinkR, 1)
        }

        ;(function loop() {
          var rand = Math.round(Math.random() * 10000) + 1000
          setTimeout(function () {
            console.log('BLINK')
            blink()
            loop()
          }, rand)
        })()

        // bones.RightShoulder.rotation.z = -Math.PI / 4

        setBones(bones)
      })
    }
  }, [scene, gltf, camera])

  const [lastUrl, setLastUrl] = useState<string | null>(null)

  useEffect(() => {
    console.log('SPEECH URL CHANGED', speechUrl)
    if (!speechUrl) return

    const url = `${process.env.REACT_APP_FILE_SERVER_URL}/${speechUrl}`
    let interval

    // @ts-ignore
    const audioContext = new AudioContext() || new webkitAudioContext()

    const request = new XMLHttpRequest()
    request.open('GET', url, true)
    request.responseType = 'arraybuffer'
    request.onload = function () {
      audioContext.decodeAudioData(request.response, onDecoded)
    }

    function onDecoded(buffer) {
      const source = audioContext.createBufferSource()
      const analyser = audioContext.createAnalyser()

      source.buffer = buffer
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      source.start()

      const array = new Uint8Array(analyser.frequencyBinCount)

      interval = setInterval(function () {
        analyser.getByteFrequencyData(array)

        var values = 0

        var length = array.length
        for (var i = 0; i < length; i++) {
          values += array[i]
        }

        // audio in expressed as one number
        var average = values / length
        var inputvolume = average

        // audio in spectrum expressed as array
        // console.log(array.toString());
        // useful for mouth shape variance

        // move the interface slider

        const currentVrm = avatar.current

        // mic based / endless animations (do stuff)

        if (currentVrm != undefined) {
          if (talktime == true) {
            // todo: more vowelshapes
            var voweldamp = 53
            var vowelmin = 12
            if (inputvolume > mouththreshold * 2) {
              console.log(
                'Setting blende rproxy shape',
                ((average - vowelmin) / voweldamp) * (mouthboost / 10),
                currentVrm.blendShapeProxy
              )
              currentVrm.blendShapeProxy.setValue(
                VRMSchema.BlendShapePresetName.A,
                ((average - vowelmin) / voweldamp) * (mouthboost / 10)
              )
            } else {
              currentVrm.blendShapeProxy.setValue(
                VRMSchema.BlendShapePresetName.A,
                0
              )
            }
          }

          // move body

          // todo: replace with ease-to-target behaviour
          var damping = 750 / (bodymotion / 10)
          var springback = 1.001

          if (average > 1 * bodythreshold) {
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.x += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.x /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.y += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.y /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.z += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Head
            ).rotation.z /= springback

            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.x += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.x /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.y += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.y /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.z += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.Neck
            ).rotation.z /= springback

            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.x += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.x /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.y += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.y /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.z += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.UpperChest
            ).rotation.z /= springback

            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.x += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.x /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.y += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.y /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.z += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.RightShoulder
            ).rotation.z /= springback

            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.x += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.x /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.y += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.y /= springback
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.z += (Math.random() - 0.5) / damping
            currentVrm.humanoid.getBoneNode(
              VRMSchema.HumanoidBoneName.LeftShoulder
            ).rotation.z /= springback
          }

          // yay/oof expression drift
          expressionyay += (Math.random() - 0.5) / expressionease
          if (expressionyay > expressionlimityay) {
            expressionyay = expressionlimityay
          }
          if (expressionyay < 0) {
            expressionyay = 0
          }
          currentVrm.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.Fun,
            expressionyay
          )
          expressionoof += (Math.random() - 0.5) / expressionease
          if (expressionoof > expressionlimitoof) {
            expressionoof = expressionlimitoof
          }
          if (expressionoof < 0) {
            expressionoof = 0
          }
          currentVrm.blendShapeProxy.setValue(
            VRMSchema.BlendShapePresetName.Angry,
            expressionoof
          )
        }
        // do something with the frequency data
      }, 10) // update the frequency data every 10 milliseconds

      source.onended = () => {
        clearInterval(interval)
        audioContext.close()
      }
    }

    request.send()

    return () => {
      if (audioContext.state !== 'closed') audioContext.close()
      clearInterval(interval)
    }
  }, [speechUrl])

  useFrame(({ clock }, delta) => {
    if (avatar.current) {
      avatar.current.update(delta)
    }
  })

  return <primitive object={gltf.scene}></primitive>
}

const AvatarFrame = ({ speechUrl }) => (
  <Canvas>
    <OrbitControls target={[0.0, 1.45, 0.0]} screenSpacePanning={true} />
    <spotLight position={[0, 2, -1]} intensity={0.4} />
    <ambientLight intensity={0.65} />
    <Suspense fallback={null}>
      <Avatar speechUrl={speechUrl} />
    </Suspense>
  </Canvas>
)

export default AvatarFrame
