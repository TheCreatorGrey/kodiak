// It's called bridge.js because it contains functions necessary to convert to and from different systems e.g. euler and matrix rotation

export function RM2EA(R) {
    function isClose(x, y, rtol=1.e-5, atol=1.e-8) {
        return Math.abs(x-y) <= atol + rtol * Math.abs(y)
    }

    let psi, theta;
    let phi = 0.0
    if (isClose(R[2][0], -1.0)) {
        theta = Math.PI/2.0
        psi = Math.atan2(R[0][1], R[0][2])
    } else if (isClose(R[2][0], 1.0)) {
        theta = -Math.PI/2.0
        psi = Math.atan2(-R[0][1], -R[0][2])
    } else {
        theta = -Math.asin(R[2][0])
        let cos_theta = Math.cos(theta)
        psi = Math.atan2(R[2][1]/cos_theta, R[2][2]/cos_theta)
        phi = Math.atan2(R[1][0]/cos_theta, R[0][0]/cos_theta)
    }

    return [psi, theta, phi]
}