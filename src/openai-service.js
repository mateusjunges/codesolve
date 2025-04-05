// OpenAI API service
const axios = require('axios');
const fs = require('fs-extra');
const FormData = require('form-data');
const path = require('path');

/**
 * Service for communicating with OpenAI API
 */
class OpenAIService {
  /**
   * Initialize the OpenAI service
   * @param {string} apiKey - OpenAI API key
   */
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  /**
   * Set or update the API key
   * @param {string} apiKey - OpenAI API key
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }

  /**
   * Get the request headers with authorization
   * @returns {Object} Headers for OpenAI requests
   */
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Convert an image file to base64
   * @param {string} filePath - Path to the image file
   * @returns {Promise<string>} Base64 encoded image
   */
  async imageToBase64(filePath) {
    try {
      const image = await fs.readFile(filePath);
      return image.toString('base64');
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  /**
   * Analyze code from a screenshot using OpenAI's vision capabilities
   * @param {string} screenshotPath - Path to the screenshot image
   * @returns {Promise<Object>} OpenAI API response
   */
  async analyzeCodeFromScreenshot(screenshotPath) {
    try {
      if (!this.apiKey) {
        throw new Error('API key is not set');
      }

      // Convert the screenshot to base64
      const base64Image = await this.imageToBase64(screenshotPath);
      
      // Prepare the request payload for GPT-4o
      const payload = {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a coding assistant that helps developers solve issues in their code. You will receive a screenshot of code and your task is to identify potential issues, explain them, and provide solutions. Format your responses using Markdown with code blocks for solutions.'
          },
          {
            role: 'user',
            content: [
              { 
                type: 'text', 
                text: 'Please analyze this code and help me resolve any issues or explain the solution to this coding problem:' 
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000
      };

      // Make the API request
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        payload,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error analyzing code with OpenAI:', error);
      
      // Return a more detailed error for debugging
      const errorMessage = error.response?.data?.error?.message || error.message;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
  }
}

module.exports = OpenAIService;
