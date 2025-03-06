import * as THREE from 'three';

/**
 * Computes quaternion as minimal rotation from [0,0,1] to vec
 * @param {THREE.Vector3} vec - The target vector to rotate to
 * @return {THREE.Quaternion} - The resulting quaternion
 */
export function z2quat(vec) {
  // Create a normalized copy of the input vector
  const vecNormalized = vec.clone().normalize();
  
  // Define z-axis
  const z = new THREE.Vector3(0, 0, 1);
  
  // Create quaternion to store result
  const quat = new THREE.Quaternion();
  
  // Special case: if vec is parallel or anti-parallel to z
  if (Math.abs(vecNormalized.z) > 0.99999) {
    // If vec points roughly in same direction as z
    if (vecNormalized.z > 0) {
      return quat.identity(); // Return identity quaternion (no rotation)
    } 
    // If vec points roughly in opposite direction to z
    else {
      // 180° rotation around any perpendicular axis, let's use x-axis
      return quat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    }
  }
  
  // Calculate the cross product (equivalent to mjuu_crossvec)
  const axis = new THREE.Vector3().crossVectors(z, vecNormalized);
  
  // Calculate the length of the cross product (equivalent to mjuu_normvec)
  const s = axis.length();
  
  // Calculate the angle between the two vectors
  const ang = Math.atan2(s, vecNormalized.z);
  
  // Normalize the axis
  axis.normalize();
  
  // Set the quaternion from the axis and angle
  quat.setFromAxisAngle(axis, ang);
  
  return quat;
}