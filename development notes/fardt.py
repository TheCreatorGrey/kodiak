import math, random


# Example quantization table (luminance-like shape, quantizes higher frequencies more aggressively)
q = [
[16,11,10,16,24,40,51,61],
[12,12,14,19,26,58,60,55],
[14,13,16,24,40,57,69,56],
[14,17,22,29,51,87,80,62],
[18,22,37,56,68,109,103,77],
[24,35,55,64,81,104,113,92],
[49,64,78,87,103,121,120,101],
[72,92,95,98,112,100,103,99]
]




M = 8
N = 8

print(random.randrange(0, 255))

block = [[255 for x in range(N)] for y in range(M)]

def dct2d(block):
    coeff = [[0.0 for x in range(N)] for y in range(M)]

    # !!! LOOK OUT! SCARY DCT ALGORITHM BELOW!!!

    # If you're unfamiliar with DCT, its the idea that any wave can be broken down and reconstructed using cosine waves of different frequencies and amplitudes
    # A row of pixels can be thought of as a wave, and a 2D grid of pixels can be thought of as multiple waves stacked on top of eachother.
    # We can compare an 8x8 grid of pixels to a bunch of 2D DCT basis functions (which can also be represented by a grid of 8x8) with different 
    # frequencies of cos waves and find which ones contribute to the chunk of pixels and how much. Numbers (coefficients) referring to the amount 
    # that a basis function contrubutes to a given chunk of pixels is enough to reconstruct it.

    # The 2D DCT basis functions can be represented by grids of 8x8 within a larger 8x8 grid of 64 basis functions.
    # The values in the grids of each function are sampled from cosine waves. The frequency of those waves are
    # higher depending on the position of the function grid within the larger basis function table.
    # If you've ever seen a table of DCT basis functions, you can imagine this as iterating through each of the squares representing the frequencies

    # !! The basis functions are not actually stored as grids !!, but can be imagined as such. The values in the "grid" of a function can be found using math.
    # Hopefully my explanation didn't make it more confusing
    # If my explanation sucks, consult Mr. Wikipedia https://en.wikipedia.org/wiki/Discrete_cosine_transform

    # This iterates through an 8x8 grid which can represent the 64 2D DCT basis functions, each with progressively higher cosine frequencies on each axis
    for i in range(M):
        for j in range(N):
            # The sum, which is how much the DCT basis function contributes to the block of pixels
            s = 0.0

            # The sum is scaled by these values
            # For some reason the functions at i=0 and j=0 are scaled differently, I don't know why
            ci = 1 / math.sqrt(M) if i == 0 else math.sqrt(2) / math.sqrt(M)
            cj = 1 / math.sqrt(N) if j == 0 else math.sqrt(2) / math.sqrt(N)            

            # Compare each pixel in the block with the values of the DCT function based on i and j
            for k in range(M):
                for l in range(N):
                    # The original pixel value (minus 128 so that it is centered around zero, ranging from -128 to 128 for a 0-255 original value)
                    term = block[k][l]-128

                    # Cos ranges from -1 to 1

                    # k = the x position of the pixel in the image chunk
                    # l = the y position of the pixel in the image chunk
                    # i = the x frequency of the function / where the basis function would be on the x axis if it was on a table
                    # j = the y frequency of the function / where the basis function would be on the y axis if it was on a table
                    # M and N are the width and height of the size of a chunk of pixels

                    # The pixel value is multiplied by a point on the 2D DCT base function on each axis
                    term *= math.cos(((2 * k + 1) * i * math.pi) / (2 * M))
                    term *= math.cos(((2 * l + 1) * j * math.pi) / (2 * N))

                    # More pixel values that align with the points on the functions they are compared to means
                    # that the function contributes more to the chunk of pixels
                    s += term

            coefficient = ci * cj * s
            quantized = int(round(coefficient / q[i][j]))
            print(quantized)

            coeff[i][j] = coefficient

    return coeff

coeff = dct2d(block)

for row in coeff:
    line = " ".join(f"{v:8.2f}" for v in row)
    print(line)