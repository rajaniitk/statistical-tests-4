// Global variables (moved outside DOMContentLoaded for global access)
let currentDatasetId = null;
let currentColumns = []; // Stores { name: 'col_name', type: 'dtype' }
let currentColumn = null; // Stores the selected column's full info object

document.addEventListener('DOMContentLoaded', function() {
    // Inject enhanced CSS styling
    const columnAnalysisCSS = `
    <style>
    /* Enhanced Column Analysis Styling */
    .column-analysis-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .dashboard-header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
    }

    .overview-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .overview-card {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        border: 1px solid #e2e8f0;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .overview-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .modal-content {
        background: white;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        max-width: 90vw;
        max-height: 90vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease-out;
    }

    .result-modal-content {
        max-width: 1000px;
        text-align: left;
        padding: 0;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 0;
    }

    .modal-header h4 {
        margin: 0;
        color: #1e293b;
        font-size: 1.5em;
    }

    .modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .modal-close:hover {
        background: #f3f4f6;
        color: #374151;
    }

    .modal-body {
        padding: 0;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Enhanced button styling for export modal */
    .export-btn-primary {
        background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .export-btn-primary:hover {
        background: linear-gradient(135deg, #45a049 0%, #1b5e20 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
    }

    .export-btn-secondary {
        background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }

    .export-btn-secondary:hover {
        background: linear-gradient(135deg, #f57c00 0%, #e65100 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 152, 0, 0.3);
    }

    /* Quality metrics styling */
    .quality-metric {
        text-align: center;
        background: white;
        padding: 25px;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        transition: transform 0.2s ease;
    }

    .quality-metric:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .metric-score {
        font-size: 2.5em;
        font-weight: 700;
        margin-bottom: 15px;
        padding: 15px;
        border-radius: 12px;
        transition: all 0.3s ease;
    }

    .metric-score.good {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #166534;
    }

    .metric-score.fair {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #92400e;
    }

    .metric-score.poor {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #991b1b;
    }

    /* Results styling */
    .relationship-result, .pattern-result, .outlier-result, .trends-result {
        background: white;
        padding: 20px;
        border-radius: 12px;
        border-left: 4px solid #3b82f6;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    /* Error and success states */
    .error-message {
        background: #fee2e2;
        color: #991b1b;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #f87171;
        margin: 10px 0;
    }

    .success-message {
        background: #dcfce7;
        color: #166534;
        padding: 15px;
        border-radius: 8px;
        border: 1px solid #bbf7d0;
        margin: 10px 0;
    }

    /* Responsive design */
    @media (max-width: 768px) {
        .column-analysis-container {
            padding: 10px;
        }
        
        .modal-content {
            padding: 20px;
            margin: 20px;
        }
        
        .result-modal-content {
            max-width: 95vw;
        }
    }
    </style>
    `;

    // Inject the CSS into the page
    document.head.insertAdjacentHTML('beforeend', columnAnalysisCSS);

    // Global variables
    let currentDatasetId = null;
    let currentColumn = null;
    let currentColumns = [];
    let currentAnalysis = null;

    // DOM Elements
    const datasetSelect = document.getElementById('column-dataset-select');
    const refreshButton = document.getElementById('refresh-column-datasets');
    const columnSelector = document.getElementById('column-selector');
    const columnSelect = document.getElementById('column-select');
    const analyzeColumnBtn = document.getElementById('analyze-column');
    const columnOverview = document.getElementById('column-overview');
    const analysisTabs = document.getElementById('analysis-tabs');
    const columnActions = document.getElementById('column-actions');
    const loadingModal = document.getElementById('column-loading-modal');

    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Initialize
    loadDatasets();
    setupEventListeners();
    
    // Utility function to safely format numbers
    function safeFormat(value, decimals = 3) {
        if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
        }
        return typeof value === 'number' ? value.toFixed(decimals) : value;
    }

    function setupEventListeners() {
        refreshButton.addEventListener('click', loadDatasets);
        datasetSelect.addEventListener('change', handleDatasetSelection);
        columnSelect.addEventListener('change', handleColumnSelection); // Added for when column is selected
        analyzeColumnBtn.addEventListener('click', analyzeColumn);

        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                switchTab(tabName);
            });
        });

        // Analysis buttons - These will trigger specific API calls
        document.getElementById('transform-column').addEventListener('click', handleTransformColumn);
        document.getElementById('clean-column').addEventListener('click', handleCleanColumn);
        document.getElementById('encode-column').addEventListener('click', handleEncodeColumn);
        document.getElementById('export-analysis').addEventListener('click', handleExportAnalysis);

        // Relationship analysis
        document.getElementById('analyze-relationship').addEventListener('click', analyzeRelationship);

        // Distribution buttons
        document.getElementById('show-histogram').addEventListener('click', () => showDistributionChart('histogram'));
        document.getElementById('show-boxplot').addEventListener('click', () => showDistributionChart('boxplot'));
        document.getElementById('show-value-counts').addEventListener('click', () => showDistributionChart('value_counts'));
    }

    async function loadDatasets() {
        showLoading();
        try {
            const response = await fetch('/api/data/datasets'); // Or your unified endpoint
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            datasetSelect.innerHTML = '<option value="">Choose a dataset...</option>';
            if (data.success && data.datasets) {
                data.datasets.forEach(dataset => {
                    const option = document.createElement('option');
                    option.value = dataset.id;
                    // Assuming dataset object has 'name' or 'filename' property
                    option.textContent = `${dataset.filename || dataset.name} (${dataset.rows} rows, ${dataset.columns} cols)`;
                    datasetSelect.appendChild(option);
                });
            } else {
                showError('No datasets found. Please upload a dataset.');
            }
        } catch (error) {
            console.error('Error loading datasets:', error);
            showError('Failed to load datasets. Please check your connection.');
        } finally {
            hideLoading();
        }
    }

    async function handleDatasetSelection() {
        const selectedId = datasetSelect.value;

        if (!selectedId) {
            columnSelector.style.display = 'none';
            hideAnalysisUI();
            currentDatasetId = null;
            currentColumns = [];
            columnSelect.innerHTML = '<option value="">Choose a column...</option>'; // Clear column select
            return;
        }

        currentDatasetId = selectedId;
        await loadDatasetColumns(selectedId);
        columnSelector.style.display = 'block';
        hideAnalysisUI(); // Hide previous analysis when dataset changes
    }

    async function loadDatasetColumns(datasetId) {
        showLoading();
        try {
            // Fetch columns for the selected dataset
            const response = await fetch(`/api/data/columns/${datasetId}`); // Adjust endpoint if needed
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.success && data.columns) {
                currentColumns = data.columns; // Store column names and types
                populateColumnSelect(data.columns);
            } else {
                throw new Error(data.error || 'Failed to load columns');
            }
        } catch (error) {
            console.error('Error loading columns:', error);
            showError('Failed to load dataset columns: ' + error.message);
            currentColumns = []; // Clear columns on error
            columnSelect.innerHTML = '<option value="">Choose a column...</option>';
        } finally {
            hideLoading();
        }
    }

    function populateColumnSelect(columns) {
        columnSelect.innerHTML = '<option value="">Choose a column...</option>';
        const compareSelect = document.getElementById('compare-column');
        if (compareSelect) {
            compareSelect.innerHTML = '<option value="">Select column to compare...</option>';
        }

        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.name;
            option.textContent = `${column.name} (${column.type})`;
            columnSelect.appendChild(option);

            if (compareSelect) {
                const compareOption = document.createElement('option');
                compareOption.value = column.name;
                compareOption.textContent = column.name;
                compareSelect.appendChild(compareOption);
            }
        });
    }

    async function handleColumnSelection() {
        const selectedColumnName = columnSelect.value;
        if (!selectedColumnName || !currentColumns) {
            hideAnalysisUI();
            currentColumn = null;
            return;
        }
        // Find the full column object from our cached list
        currentColumn = currentColumns.find(col => col.name === selectedColumnName);
        // Optionally, you could fetch more detailed column info here if needed
        // For now, we'll assume currentColumns contains enough basic info
        if (currentColumn) {
            displayColumnOverview(currentColumn); // Display basic info immediately
            analysisTabs.style.display = 'block'; // Show tabs for analysis
            columnActions.style.display = 'block';
        } else {
            hideAnalysisUI();
            currentColumn = null;
        }
    }

    async function analyzeColumn() {
        if (!currentDatasetId || !columnSelect.value) {
            showError('Please select a dataset and a column to analyze.');
            return;
        }

        const selectedColumnName = columnSelect.value;
        currentColumn = currentColumns.find(col => col.name === selectedColumnName);

        if (!currentColumn) {
            showError('Selected column not found in current dataset.');
            return;
        }

        showLoading();

        try {
            // Fetch comprehensive summary first, which will likely include stats and quality
            // The structure of the response from your backend will dictate how you parse this.
            // Assuming a single endpoint returning a detailed analysis object for the column.
            // Let's use /api/column_analysis/summary/<dataset_id>?column=<column_name>
            const response = await fetch(`/api/column_analysis/summary/${currentDatasetId}?column=${encodeURIComponent(selectedColumnName)}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.summary) {
                const analysis = data.summary; // The comprehensive summary object

                // Update Column Overview
                displayColumnOverview(analysis); // Pass the full analysis object

                // Populate different analysis sections based on the API response
                displayBasicStats(analysis); // Pass full analysis object
                displayDistribution(analysis.distribution_summary, analysis.data_type, analysis); // Pass full analysis for distribution
                displayPatterns(analysis.insights); // Using insights as a placeholder for patterns
                displayQuality(analysis.quality_metrics); // Assuming quality_metrics is a dict

                columnOverview.style.display = 'block';
                analysisTabs.style.display = 'block';
                columnActions.style.display = 'block';

            } else {
                throw new Error(data.error || 'Failed to analyze column');
            }

        } catch (error) {
            console.error('Error analyzing column:', error);
            showError('Failed to analyze column: ' + error.message);
            hideAnalysisUI(); // Hide UI if analysis fails
        } finally {
            hideLoading();
        }
    }

    function displayColumnOverview(columnInfo) {
        // Use the fetched analysis data, not mock data
        document.getElementById('column-name').textContent = columnInfo.column_name || '-';
        document.getElementById('column-type').textContent = columnInfo.data_type || '-';

        // Assuming basic_statistics contains these values
        const basicStats = columnInfo.basic_statistics || {};
        document.getElementById('non-null-count').textContent = basicStats.non_null_count ? basicStats.non_null_count.toLocaleString() : '-';
        const missingPercentage = safeFormat(basicStats.null_percentage, 1) !== 'N/A' ? safeFormat(basicStats.null_percentage, 1) : '-';
        document.getElementById('missing-values').textContent = `${basicStats.null_count ? basicStats.null_count.toLocaleString() : '-'} (${missingPercentage}%)`;
        document.getElementById('unique-values').textContent = basicStats.unique_count ? basicStats.unique_count.toLocaleString() : '-';
        document.getElementById('memory-usage').textContent = basicStats.memory_usage ? formatBytes(basicStats.memory_usage) : '-';
    }

    function displayBasicStats(analysis) {
        const container = document.getElementById('basic-stats-content');
        container.innerHTML = ''; // Clear previous content

        if (!analysis) {
            container.innerHTML = '<p>No analysis data available.</p>';
            return;
        }

        // Get the right data source - distribution_summary for statistical measures
        const distributionData = analysis.distribution_summary || {};
        const basicInfo = analysis.basic_statistics || {};
        const dataType = analysis.data_type || currentColumn?.type || '';

        let html = '';
        
        // Check if it's a numeric column
        if (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float')) {
            html += '<div class="stats-grid">';
            html += `
                <div class="stat-item">
                    <strong>COUNT</strong>
                    <span>${basicInfo.count ? basicInfo.count.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>MEAN</strong>
                    <span>${safeFormat(distributionData.mean)}</span>
                </div>
                <div class="stat-item">
                    <strong>MEDIAN</strong>
                    <span>${safeFormat(distributionData.median)}</span>
                </div>
                <div class="stat-item">
                    <strong>STD DEV</strong>
                    <span>${safeFormat(distributionData.std)}</span>
                </div>
                <div class="stat-item">
                    <strong>MIN</strong>
                    <span>${safeFormat(distributionData.min)}</span>
                </div>
                <div class="stat-item">
                    <strong>MAX</strong>
                    <span>${safeFormat(distributionData.max)}</span>
                </div>
                <div class="stat-item">
                    <strong>IQR</strong>
                    <span>${safeFormat(distributionData.iqr)}</span>
                </div>
                <div class="stat-item">
                    <strong>SKEWNESS</strong>
                    <span>${safeFormat(distributionData.skewness)}</span>
                </div>
                <div class="stat-item">
                    <strong>KURTOSIS</strong>
                    <span>${safeFormat(distributionData.kurtosis)}</span>
                </div>
                <div class="stat-item">
                    <strong>VARIANCE</strong>
                    <span>${safeFormat(distributionData.variance)}</span>
                </div>
            `;
            html += '</div>';
        } else if (dataType === 'object' || dataType.toLowerCase().includes('category')) {
            // Categorical data
            html += '<div class="category-stats">';
            html += '<div class="stats-grid">';
            html += `
                <div class="stat-item">
                    <strong>UNIQUE VALUES</strong>
                    <span>${distributionData.unique_values ? distributionData.unique_values.toLocaleString() : basicInfo.unique_count ? basicInfo.unique_count.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>MOST FREQUENT</strong>
                    <span>${distributionData.most_frequent || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>FREQUENCY</strong>
                    <span>${distributionData.most_frequent_count ? distributionData.most_frequent_count.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>CONCENTRATION</strong>
                    <span>${safeFormat(distributionData.concentration * 100, 1)}%</span>
                </div>
            `;
            html += '</div>';
            html += '<h5>Value Counts:</h5>';
            html += '<div class="value-counts">';
            if (distributionData.value_counts) {
                const totalCount = basicInfo.count || Object.values(distributionData.value_counts).reduce((a, b) => a + b, 0);
                for (const [value, count] of Object.entries(distributionData.value_counts)) {
                    const percentage = ((count / totalCount) * 100).toFixed(1);
                    html += `
                        <div class="value-count-item">
                            <span class="value">${value}</span>
                            <span class="count">${count} (${percentage}%)</span>
                        </div>
                    `;
                }
            } else {
                html += '<p>No detailed value counts available.</p>';
            }
            html += '</div>'; // Close value-counts
            html += '</div>'; // Close category-stats
        } else {
            // For other data types (datetime, etc.)
            html += '<div class="stats-grid">';
            html += `
                <div class="stat-item">
                    <strong>COUNT</strong>
                    <span>${basicInfo.count ? basicInfo.count.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>NON-NULL</strong>
                    <span>${basicInfo.non_null_count ? basicInfo.non_null_count.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>UNIQUE VALUES</strong>
                    <span>${basicInfo.unique_count ? basicInfo.unique_count.toLocaleString() : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>DATA TYPE</strong>
                    <span>${dataType || 'N/A'}</span>
                </div>
            `;
            html += '</div>';
        }

        container.innerHTML = html;
    }

    function displayDistribution(distributionData, dataType, fullAnalysis) {
        const container = document.getElementById('distribution-content');
        container.innerHTML = ''; // Clear previous content

        // Store current distribution data globally for chart functions
        window.currentDistributionData = distributionData;
        window.currentDistributionType = dataType;
        window.currentFullAnalysis = fullAnalysis;

        if (!distributionData || Object.keys(distributionData).length === 0) {
            container.innerHTML = '<p>Distribution data not available. Click "Analyze Column" to load distribution data.</p>';
            return;
        }

        let html = '<div class="distribution-analysis">';
        
        if (dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float'))) {
            // Numeric distribution
            html += '<h5>Distribution Summary</h5>';
            html += '<div class="stats-grid">';
            html += `
                <div class="stat-item">
                    <strong>MEAN</strong>
                    <span>${safeFormat(distributionData.mean)}</span>
                </div>
                <div class="stat-item">
                    <strong>MEDIAN</strong>
                    <span>${safeFormat(distributionData.median)}</span>
                </div>
                <div class="stat-item">
                    <strong>MODE</strong>
                    <span>${safeFormat(distributionData.mode)}</span>
                </div>
                <div class="stat-item">
                    <strong>RANGE</strong>
                    <span>${safeFormat(distributionData.range)}</span>
                </div>
                <div class="stat-item">
                    <strong>SKEWNESS</strong>
                    <span>${safeFormat(distributionData.skewness)}</span>
                </div>
                <div class="stat-item">
                    <strong>KURTOSIS</strong>
                    <span>${safeFormat(distributionData.kurtosis)}</span>
                </div>
                <div class="stat-item">
                    <strong>CV</strong>
                    <span>${safeFormat(distributionData.cv)}</span>
                </div>
            `;
            html += '</div>';
            
            // Distribution interpretation
            html += '<div class="distribution-interpretation">';
            html += '<h6>Distribution Characteristics:</h6>';
            const skewness = distributionData.skewness || 0;
            const kurtosis = distributionData.kurtosis || 0;
            
            if (Math.abs(skewness) < 0.5) {
                html += '<p class="interpretation-item">📊 <strong>Symmetry:</strong> Approximately symmetric distribution</p>';
            } else if (skewness > 0.5) {
                html += '<p class="interpretation-item">📈 <strong>Skewness:</strong> Right-skewed (longer tail on the right)</p>';
            } else {
                html += '<p class="interpretation-item">📉 <strong>Skewness:</strong> Left-skewed (longer tail on the left)</p>';
            }
            
            if (Math.abs(kurtosis) < 1) {
                html += '<p class="interpretation-item">🎯 <strong>Kurtosis:</strong> Normal tail behavior</p>';
            } else if (kurtosis > 1) {
                html += '<p class="interpretation-item">⚡ <strong>Kurtosis:</strong> Heavy tails (more extreme values)</p>';
            } else {
                html += '<p class="interpretation-item">🎈 <strong>Kurtosis:</strong> Light tails (fewer extreme values)</p>';
            }
            html += '</div>';
            
        } else {
            // Categorical distribution
            html += '<h5>Category Distribution</h5>';
            html += '<div class="stats-grid">';
            html += `
                <div class="stat-item">
                    <strong>UNIQUE VALUES</strong>
                    <span>${distributionData.unique_values || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>MOST FREQUENT</strong>
                    <span style="font-size: 0.9em;">${distributionData.most_frequent || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>FREQUENCY</strong>
                    <span>${distributionData.most_frequent_count || 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>CONCENTRATION</strong>
                    <span>${distributionData.concentration ? safeFormat(distributionData.concentration * 100, 1) + '%' : 'N/A'}</span>
                </div>
                <div class="stat-item">
                    <strong>ENTROPY</strong>
                    <span>${safeFormat(distributionData.entropy)}</span>
                </div>
            `;
            html += '</div>';
            
            // Category interpretation
            html += '<div class="distribution-interpretation">';
            html += '<h6>Distribution Characteristics:</h6>';
            const concentration = distributionData.concentration || 0;
            const entropy = distributionData.entropy || 0;
            
            if (concentration > 0.8) {
                html += '<p class="interpretation-item">🎯 <strong>Highly concentrated:</strong> One category dominates</p>';
            } else if (concentration > 0.5) {
                html += '<p class="interpretation-item">📊 <strong>Moderately concentrated:</strong> Some categories are more common</p>';
            } else {
                html += '<p class="interpretation-item">⚖️ <strong>Well distributed:</strong> Categories are relatively balanced</p>';
            }
            
            if (entropy > 3) {
                html += '<p class="interpretation-item">🌈 <strong>High diversity:</strong> Many different categories</p>';
            } else if (entropy > 1) {
                html += '<p class="interpretation-item">📈 <strong>Moderate diversity:</strong> Several different categories</p>';
            } else {
                html += '<p class="interpretation-item">🔒 <strong>Low diversity:</strong> Few distinct categories</p>';
            }
            html += '</div>';
        }
        
        // Interactive chart area
        html += '<div class="chart-visualization" id="chart-visualization">';
        html += '<h6>📊 Interactive Visualizations</h6>';
        html += '<p>Use the buttons above to generate specific visualizations:</p>';
        html += '<div class="chart-visualization-area" id="chart-visualization-area">';
        html += '<div class="chart-placeholder">Select a visualization type to display charts here</div>';
        html += '</div>';
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
    }

    function displayPatterns(insights) {
        const valuePatternsContainer = document.getElementById('value-patterns');
        const outlierDetectionContainer = document.getElementById('outlier-detection');
        const trendsAnalysisContainer = document.getElementById('trends-analysis');

        // Display insights if available
        if (insights && insights.length > 0) {
            let html = '<div class="pattern-result">';
            html += '<h6>🔍 Data Insights</h6>';
            insights.forEach(insight => {
                html += `<div class="insight-item">💡 ${insight}</div>`;
            });
            html += '</div>';
            valuePatternsContainer.innerHTML = html;
        } else {
            valuePatternsContainer.innerHTML = '<div class="pattern-result"><h6>🔍 Value Patterns</h6><p>Click on the Patterns tab to load detailed pattern analysis.</p></div>';
        }

        // Initialize other sections with loading messages
        outlierDetectionContainer.innerHTML = '<div class="pattern-result"><h6>⚠️ Outlier Detection</h6><p>Loading outlier analysis...</p></div>';
        trendsAnalysisContainer.innerHTML = '<div class="pattern-result"><h6>📈 Trends Analysis</h6><p>Loading trend analysis...</p></div>';

        // Load specific pattern data when this function is called
        fetchOutlierInfo();
        fetchTrendInfo();
    }

    function displayQuality(qualityMetrics) {
        const completenessContainer = document.getElementById('completeness-analysis');
        const consistencyContainer = document.getElementById('consistency-analysis');
        const validityContainer = document.getElementById('validity-analysis');

        // Assuming qualityMetrics is an object like { completeness: { score: 90, description: '...' }, ... }
        if (qualityMetrics) {
            completenessContainer.innerHTML = renderQualityMetric(qualityMetrics.completeness, 'good'); // Need to map score ranges to classes
            consistencyContainer.innerHTML = renderQualityMetric(qualityMetrics.consistency, 'fair'); // Placeholder
            validityContainer.innerHTML = renderQualityMetric(qualityMetrics.validity, 'good'); // Placeholder
        } else {
            completenessContainer.innerHTML = '<p>Quality metrics unavailable.</p>';
            consistencyContainer.innerHTML = '<p>Quality metrics unavailable.</p>';
            validityContainer.innerHTML = '<p>Quality metrics unavailable.</p>';
        }
    }

    function renderQualityMetric(metric, defaultClass) {
        if (!metric) return '<div class="quality-metric"><div class="metric-score">N/A</div><p>Data Unavailable</p></div>';

        const score = metric.score;
        let classToApply = defaultClass; // Default class if no specific mapping

        // Example mapping for completeness score
        if (typeof score === 'number') {
            if (score >= 95) classToApply = 'good';
            else if (score >= 80) classToApply = 'fair';
            else classToApply = 'poor';
        }

        return `
            <div class="quality-metric">
                <div class="metric-score ${classToApply}">${typeof score === 'number' ? score.toFixed(1) + '%' : 'N/A'}</div>
                <p>${metric.description || 'Data quality metric'}</p>
            </div>
        `;
    }

    async function fetchOutlierInfo() {
        if (!currentDatasetId || !currentColumn) return;
        try {
            // Fetch outliers for the current column
            const response = await fetch(`/api/column_analysis/outliers/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&method=iqr`);
            if (!response.ok) throw new Error('Failed to fetch outlier data');
            const data = await response.json();

            if (data.success && data.outliers) {
                // The outlier data structure is different - it contains outlier_detection with methods
                const outlierData = data.outliers.outlier_detection;
                if (outlierData) {
                    // Use the IQR method data
                    const iqrData = outlierData.iqr_method;
                    if (iqrData) {
                        const percentage = safeFormat(iqrData.percentage, 1);
                        const lowerBound = safeFormat(iqrData.lower_bound, 2);
                        const upperBound = safeFormat(iqrData.upper_bound, 2);
                        const container = document.getElementById('outlier-detection');
                        container.innerHTML = `
                            <div class="outlier-result">
                                <p>${iqrData.count || 0} potential outliers detected (${percentage}% of data)</p>
                                <p>Using IQR method (bounds: ${lowerBound} - ${upperBound})</p>
                                <p>Consider investigating and handling these values.</p>
                            </div>
                        `;
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching outlier info:", error);
            document.getElementById('outlier-detection').innerHTML = '<p>Could not fetch outlier information.</p>';
        }
    }

    async function fetchTrendInfo() {
        if (!currentDatasetId || !currentColumn || !currentColumn.type || !(currentColumn.type.toLowerCase().includes('date') || currentColumn.type.toLowerCase().includes('time'))) {
             // Only fetch if column is temporal
            document.getElementById('trends-analysis').innerHTML = '<p>No temporal analysis for this column type.</p>';
            return;
        }
        try {
            // Fetch temporal analysis (which includes trends)
            const response = await fetch(`/api/column_analysis/temporal_analysis/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}`);
            if (!response.ok) throw new Error('Failed to fetch temporal data');
            const data = await response.json();

            if (data.success && data.temporal) {
                const temporalData = data.temporal;
                const container = document.getElementById('trends-analysis');
                let trendInsight = 'No trend information available.';

                // Infer trend from temporal_summary.temporal_patterns or specific trend analysis if available
                if (temporalData.trends && temporalData.trends.note) {
                    trendInsight = temporalData.trends.note;
                } else if (temporalData.temporal_patterns && temporalData.temporal_patterns.date_range) {
                    trendInsight = `Data spans from ${temporalData.temporal_patterns.date_range.start} to ${temporalData.temporal_patterns.date_range.end}.`;
                } else {
                    trendInsight = 'No specific trend information found.';
                }
                container.innerHTML = `<div class="trends-result"><p>${trendInsight}</p></div>`;
            }
        } catch (error) {
            console.error("Error fetching trend info:", error);
            document.getElementById('trends-analysis').innerHTML = '<p>Could not fetch trend information.</p>';
        }
    }


    // Handler for when a column is selected from the dropdown
    function handleColumnSelection() {
        const selectedColumnName = columnSelect.value;
        if (!selectedColumnName) {
            hideAnalysisUI();
            currentColumn = null;
            return;
        }
        // Find the full column object from our cached list
        currentColumn = currentColumns.find(col => col.name === selectedColumnName);

        if (currentColumn) {
            // Display overview and enable tabs immediately upon selection
            displayColumnOverview(currentColumn); // Use basic info from cached currentColumns
            analysisTabs.style.display = 'block';
            columnActions.style.display = 'block';
            // Clear previous analysis results
            document.getElementById('basic-stats-content').innerHTML = '<p>Select a column and click "Analyze Column" for details.</p>';
            document.getElementById('distribution-content').innerHTML = '';
            document.getElementById('value-patterns').innerHTML = '';
            document.getElementById('outlier-detection').innerHTML = '';
            document.getElementById('trends-analysis').innerHTML = '';
            document.getElementById('completeness-analysis').innerHTML = '';
            document.getElementById('consistency-analysis').innerHTML = '';
            document.getElementById('validity-analysis').innerHTML = '';
            document.getElementById('relationship-results').innerHTML = '';
        } else {
            hideAnalysisUI();
            currentColumn = null;
        }
    }


    async function analyzeRelationship() {
        const compareColumnName = document.getElementById('compare-column').value;

        if (!currentDatasetId || !currentColumn || !compareColumnName) {
            showError('Please select a dataset, a primary column, and a column to compare with.');
            return;
        }

        if (compareColumnName === currentColumn.name) {
            showError('Please select a different column for comparison.');
            return;
        }

        showLoading();
        const container = document.getElementById('relationship-results');
        container.innerHTML = ''; // Clear previous results

        try {
            // Fetch bivariate analysis. Adjust endpoint and parameters as per your backend.
            // Assuming an endpoint like: GET /api/column_analysis/relationships/<dataset_id>?column1=<col1>&column2=<col2>
            const response = await fetch(`/api/column_analysis/relationships/${currentDatasetId}?column1=${encodeURIComponent(currentColumn.name)}&column2=${encodeURIComponent(compareColumnName)}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.analysis) {
                const analysis = data.analysis; // This should be the bivariate analysis object

                let html = `<div class="relationship-result">`;
                html += `<h5>Relationship Analysis: ${currentColumn.name} vs ${compareColumnName}</h5>`;

                if (analysis.error) {
                    html += `<p class="error">${analysis.error}</p>`;
                } else {
                    // Display correlation if available (numeric-numeric)
                    if (analysis.correlation_analysis) {
                        const corr = analysis.correlation_analysis.pearson || analysis.correlation_analysis.spearman;
                        const strength = analysis.correlation_analysis.correlation_strength || 'N/A';
                        const pValue = corr ? corr.p_value : undefined;

                        html += `
                            <div class="relationship-stats">
                                <div class="stat-item">
                                    <strong>Correlation (${corr?.method || 'Pearson'}):</strong> ${safeFormat(corr?.correlation, 4)}
                                </div>
                                <div class="stat-item">
                                    <strong>P-value:</strong> ${safeFormat(pValue, 4)}
                                </div>
                                <div class="stat-item">
                                    <strong>Significance:</strong> ${pValue !== undefined ? (pValue < 0.05 ? 'Significant' : 'Not Significant') : 'N/A'}
                                </div>
                                <div class="stat-item">
                                    <strong>Strength:</strong> ${strength.toUpperCase()}
                                </div>
                            </div>
                        `;
                    }
                    // Display association/test results if available (e.g., for categorical)
                    else if (analysis.association_analysis || analysis.statistical_tests) {
                        // Extract relevant info from association_analysis or statistical_tests
                        // This depends heavily on your backend's response structure
                        html += '<p>Association/Test results would be displayed here.</p>';
                    }

                    // Display insights
                    if (analysis.insights && analysis.insights.length > 0) {
                        html += `<div class="relationship-interpretation">
                                    <p><strong>Insights:</strong></p>
                                    <ul>${analysis.insights.map(insight => `<li>${insight}</li>`).join('')}</ul>
                                 </div>`;
                    }
                }
                html += `</div>`;
                container.innerHTML = html;
            } else {
                throw new Error(data.error || 'Failed to analyze relationship');
            }

        } catch (error) {
            console.error('Error analyzing relationship:', error);
            container.innerHTML = `<div class="error-message">Failed to analyze relationship: ${error.message}</div>`;
        } finally {
            hideLoading();
        }
    }

    function switchTab(tabName) {
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);

        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');

        // Trigger specific data loading for tabs
        if (!currentDatasetId || !currentColumn) return;

        switch(tabName) {
            case 'basic-stats':
                // Basic stats are already loaded by analyzeColumn
                break;
            case 'distribution':
                fetchDistributionData();
                break;
            case 'patterns':
                fetchPatternsData();
                break;
            case 'quality':
                fetchQualityData();
                break;
            case 'relationships':
                // Relationships need user interaction to select compare column
                break;
        }
    }

    // This function has been moved and enhanced above

    // --- Helper functions for rendering ---

    // Function to format bytes for display
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }


    function showLoading() {
        loadingModal.style.display = 'flex';
    }

    function hideLoading() {
        loadingModal.style.display = 'none';
    }

    function showError(message) {
        alert(message); // In a real app, use a proper notification system
    }
    
    function showResultModal(title, content) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('result-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'result-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content result-modal-content">
                    <div class="modal-header">
                        <h4 id="result-modal-title"></h4>
                        <button onclick="closeResultModal()" class="modal-close">×</button>
                    </div>
                    <div class="modal-body" id="result-modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        document.getElementById('result-modal-title').textContent = title;
        document.getElementById('result-modal-body').innerHTML = content;
        modal.style.display = 'flex';
    }
    
    function closeResultModal() {
        const modal = document.getElementById('result-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    function downloadJsonData(filename, data) {
        try {
            const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            showMessage('Success', 'success', `File ${filename} downloaded successfully!`);
        } catch (error) {
            console.error('Download error:', error);
            showError('Failed to download file: ' + error.message);
        }
    }
    
    function showMessage(title, type, message = '') {
        // Enhanced message function for different types
        const icons = {
            'success': '✅',
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌'
        };
        
        const icon = icons[type] || icons['info'];
        alert(`${icon} ${title}\n${message}`);
    }

    function hideAnalysisUI() {
        columnOverview.style.display = 'none';
        analysisTabs.style.display = 'none';
        columnActions.style.display = 'none';
        currentColumn = null; // Clear current column when UI is hidden
    }

    // --- Specific Tab Data Fetching ---
    // These are called when the respective tabs become active if data isn't pre-loaded

    async function fetchDistributionData() {
        if (!currentDatasetId || !currentColumn) return;
        try {
            const response = await fetch(`/api/column_analysis/distribution/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}`);
            if (!response.ok) throw new Error('Failed to fetch distribution data');
            const data = await response.json();
            if (data.success && data.distribution) {
                displayDistribution(data.distribution, currentColumn.type, data);
            }
        } catch (error) {
            console.error("Error fetching distribution data:", error);
            document.getElementById('distribution-content').innerHTML = '<p>Could not fetch distribution data.</p>';
        }
    }

    // --- Distribution Chart Functions ---
    async function showDistributionChart(chartType) {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const chartContainer = document.getElementById('distribution-content');
        if (!chartContainer) {
            showError('Chart container not found. Please analyze the column first.');
            return;
        }

        showLoading();
        
        try {
            // Use backend chart generation
            const response = await fetch(`/api/column_analysis/generate_chart/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&chart_type=${chartType}`);
            if (!response.ok) throw new Error('Failed to generate chart');
            const data = await response.json();

            if (data.success && data.chart) {
                chartContainer.innerHTML = data.chart.chart_html;
            } else {
                throw new Error(data.chart?.error || 'Failed to generate chart');
            }
        } catch (error) {
            console.error('Chart generation error:', error);
            chartContainer.innerHTML = '<div class="error-message">Failed to generate chart: ' + error.message + '</div>';
        } finally {
            hideLoading();
        }
    }

    function generateHistogram(distributionData, dataType) {
        if (dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float'))) {
            // Numeric histogram simulation
            const mean = distributionData.mean || 0;
            const std = distributionData.std || 1;
            const min = distributionData.min || 0;
            const max = distributionData.max || 100;
            
            return `
                <div class="chart-result">
                    <h6>📊 Histogram - ${currentColumn.name}</h6>
                    <div class="histogram-chart">
                        <div class="histogram-info">
                            <p><strong>Data Range:</strong> ${safeFormat(min)} to ${safeFormat(max)}</p>
                            <p><strong>Mean:</strong> ${safeFormat(mean)} | <strong>Std Dev:</strong> ${safeFormat(std)}</p>
                        </div>
                        <div class="histogram-bars">
                            ${generateHistogramBars(distributionData)}
                        </div>
                        <div class="histogram-labels">
                            <span>Min (${safeFormat(min)})</span>
                            <span>Mean (${safeFormat(mean)})</span>
                            <span>Max (${safeFormat(max)})</span>
                        </div>
                    </div>
                    <div class="chart-interpretation">
                        <h6>📈 Interpretation:</h6>
                        <p>${interpretHistogram(distributionData)}</p>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="chart-result">
                    <h6>📊 Histogram - ${currentColumn.name}</h6>
                    <p class="chart-note">Histogram is not applicable for categorical data. Use Value Counts instead.</p>
                    <button onclick="showDistributionChart('value_counts')" class="btn btn-primary">Show Value Counts</button>
                </div>
            `;
        }
    }

    function generateBoxPlot(distributionData, dataType) {
        if (dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float'))) {
            const q1 = distributionData.q1 || (distributionData.mean - distributionData.std);
            const q2 = distributionData.median || distributionData.mean;
            const q3 = distributionData.q3 || (distributionData.mean + distributionData.std);
            const min = distributionData.min || 0;
            const max = distributionData.max || 100;
            
            return `
                <div class="chart-result">
                    <h6>📦 Box Plot - ${currentColumn.name}</h6>
                    <div class="boxplot-chart">
                        <div class="boxplot-container">
                            ${generateBoxPlotVisualization(min, q1, q2, q3, max)}
                        </div>
                        <div class="boxplot-stats">
                            <div class="boxplot-stat">
                                <strong>Min:</strong> ${safeFormat(min)}
                            </div>
                            <div class="boxplot-stat">
                                <strong>Q1:</strong> ${safeFormat(q1)}
                            </div>
                            <div class="boxplot-stat">
                                <strong>Median:</strong> ${safeFormat(q2)}
                            </div>
                            <div class="boxplot-stat">
                                <strong>Q3:</strong> ${safeFormat(q3)}
                            </div>
                            <div class="boxplot-stat">
                                <strong>Max:</strong> ${safeFormat(max)}
                            </div>
                        </div>
                    </div>
                    <div class="chart-interpretation">
                        <h6>📊 Interpretation:</h6>
                        <p>${interpretBoxPlot(distributionData)}</p>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="chart-result">
                    <h6>📦 Box Plot - ${currentColumn.name}</h6>
                    <p class="chart-note">Box Plot is not applicable for categorical data. Use Value Counts instead.</p>
                    <button onclick="showDistributionChart('value_counts')" class="btn btn-primary">Show Value Counts</button>
                </div>
            `;
        }
    }

    function generateValueCounts(distributionData, dataType) {
        const valueCounts = distributionData.value_counts || {};
        const totalCount = distributionData.count || Object.values(valueCounts).reduce((a, b) => a + b, 0) || 1;
        
        return `
            <div class="chart-result">
                <h6>📊 Value Counts - ${currentColumn.name}</h6>
                <div class="value-counts-chart">
                    <div class="value-counts-header">
                        <span>Value</span>
                        <span>Count</span>
                        <span>Percentage</span>
                        <span>Bar</span>
                    </div>
                    ${generateValueCountsBars(valueCounts, totalCount)}
                </div>
                <div class="chart-interpretation">
                    <h6>📈 Summary:</h6>
                    <p>Showing top ${Object.keys(valueCounts).length} values. 
                    ${dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float')) ? 
                        'This shows the frequency distribution of values in the numeric column.' : 
                        'This shows the frequency distribution of categories.'}</p>
                </div>
            </div>
        `;
    }

    function generateHistogramBars(distributionData) {
        // Simulate histogram bars based on statistical properties
        const bars = [];
        const mean = distributionData.mean || 0;
        const std = distributionData.std || 1;
        const skewness = distributionData.skewness || 0;
        
        // Generate 10 bars representing the distribution
        for (let i = 0; i < 10; i++) {
            const position = i / 9; // 0 to 1
            let height;
            
            if (Math.abs(skewness) < 0.5) {
                // Normal-like distribution
                height = Math.exp(-Math.pow((position - 0.5) * 4, 2)) * 100;
            } else if (skewness > 0) {
                // Right-skewed
                height = Math.exp(-Math.pow((position - 0.2) * 3, 2)) * 100;
            } else {
                // Left-skewed
                height = Math.exp(-Math.pow((position - 0.8) * 3, 2)) * 100;
            }
            
            bars.push(`<div class="histogram-bar" style="height: ${height}%; background: linear-gradient(to top, #3b82f6, #60a5fa);"></div>`);
        }
        
        return bars.join('');
    }

    function generateBoxPlotVisualization(min, q1, median, q3, max) {
        return `
            <div class="boxplot-visual">
                <div class="boxplot-whisker-left" style="left: 0%; width: 20%;"></div>
                <div class="boxplot-box" style="left: 20%; width: 60%;">
                    <div class="boxplot-median" style="left: 50%;"></div>
                </div>
                <div class="boxplot-whisker-right" style="left: 80%; width: 20%;"></div>
                <div class="boxplot-labels">
                    <span style="left: 0%;">Min</span>
                    <span style="left: 20%;">Q1</span>
                    <span style="left: 50%;">Median</span>
                    <span style="left: 80%;">Q3</span>
                    <span style="left: 100%;">Max</span>
                </div>
            </div>
        `;
    }

    function generateValueCountsBars(valueCounts, totalCount) {
        const entries = Object.entries(valueCounts).slice(0, 20); // Top 20 values
        const maxCount = Math.max(...Object.values(valueCounts));
        
        return entries.map(([value, count]) => {
            const percentage = ((count / totalCount) * 100).toFixed(1);
            const barWidth = (count / maxCount) * 100;
            
            return `
                <div class="value-count-row">
                    <span class="value-label">${value}</span>
                    <span class="count-value">${count.toLocaleString()}</span>
                    <span class="percentage-value">${percentage}%</span>
                    <div class="count-bar-container">
                        <div class="count-bar" style="width: ${barWidth}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function interpretHistogram(distributionData) {
        const skewness = distributionData.skewness || 0;
        const kurtosis = distributionData.kurtosis || 0;
        
        let interpretation = '';
        
        if (Math.abs(skewness) < 0.5) {
            interpretation += 'The distribution appears approximately symmetric. ';
        } else if (skewness > 0.5) {
            interpretation += 'The distribution is right-skewed with a longer tail extending to higher values. ';
        } else {
            interpretation += 'The distribution is left-skewed with a longer tail extending to lower values. ';
        }
        
        if (Math.abs(kurtosis) < 1) {
            interpretation += 'The tail behavior is similar to a normal distribution.';
        } else if (kurtosis > 1) {
            interpretation += 'The distribution has heavy tails with more extreme values than expected.';
        } else {
            interpretation += 'The distribution has light tails with fewer extreme values.';
        }
        
        return interpretation;
    }

    function interpretBoxPlot(distributionData) {
        const median = distributionData.median || distributionData.mean || 0;
        const mean = distributionData.mean || 0;
        const skewness = distributionData.skewness || 0;
        
        let interpretation = `The median value is ${safeFormat(median)}. `;
        
        if (Math.abs(mean - median) > (distributionData.std || 1) * 0.5) {
            interpretation += 'There is a notable difference between mean and median, suggesting skewness. ';
        }
        
        if (Math.abs(skewness) > 0.5) {
            interpretation += skewness > 0 ? 
                'The distribution is skewed right, with outliers likely in the upper range. ' :
                'The distribution is skewed left, with outliers likely in the lower range. ';
        } else {
            interpretation += 'The distribution appears relatively balanced. ';
        }
        
        return interpretation;
    }

    async function fetchPatternsData() {
        if (!currentDatasetId || !currentColumn) return;
        
        // Fetch patterns data
        try {
            const response = await fetch(`/api/column_analysis/patterns/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}`);
            if (!response.ok) throw new Error('Failed to fetch patterns data');
            const data = await response.json();
            
            if (data.success && data.patterns) {
                const patterns = data.patterns;
                const valuePatternsContainer = document.getElementById('value-patterns');
                
                let html = '<div class="pattern-result">';
                if (patterns.string_patterns) {
                    const sp = patterns.string_patterns;
                    html += `
                        <h6>String Patterns</h6>
                        <p>Average Length: ${safeFormat(sp.average_length, 1)} characters</p>
                        <p>Contains Numbers: ${sp.contains_numbers ? 'Yes' : 'No'}</p>
                        <p>Contains Special Characters: ${sp.contains_special_chars ? 'Yes' : 'No'}</p>
                        <p>Uppercase Values: ${sp.all_uppercase}</p>
                        <p>Lowercase Values: ${sp.all_lowercase}</p>
                    `;
                } else {
                    html += '<p>No specific patterns detected.</p>';
                }
                html += '</div>';
                valuePatternsContainer.innerHTML = html;
            }
        } catch (error) {
            console.error("Error fetching patterns data:", error);
            document.getElementById('value-patterns').innerHTML = '<p>Could not fetch patterns data.</p>';
        }

        // Also fetch outlier and trend info as before
        fetchOutlierInfo();
        fetchTrendInfo();
    }

    async function fetchQualityData() {
        if (!currentDatasetId || !currentColumn) return;
        try {
            const response = await fetch(`/api/column_analysis/data_quality/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}`);
            if (!response.ok) throw new Error('Failed to fetch quality data');
            const data = await response.json();
            
            if (data.success && data.quality) {
                const quality = data.quality;
                
                // Update quality sections
                document.getElementById('completeness-analysis').innerHTML = renderQualityMetric(quality.completeness, 'good');
                document.getElementById('consistency-analysis').innerHTML = renderQualityMetric(quality.consistency, 'good');
                document.getElementById('validity-analysis').innerHTML = renderQualityMetric(quality.validity, 'good');
            }
        } catch (error) {
            console.error("Error fetching quality data:", error);
            document.getElementById('completeness-analysis').innerHTML = '<p>Could not fetch quality data.</p>';
            document.getElementById('consistency-analysis').innerHTML = '<p>Could not fetch quality data.</p>';
            document.getElementById('validity-analysis').innerHTML = '<p>Could not fetch quality data.</p>';
        }
    }

    // --- Action Handlers ---
    async function handleTransformColumn() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const transformationType = prompt('Enter transformation type (standardize, normalize, log, sqrt):') || 'standardize';
        
        showLoading();
        try {
            const response = await fetch(`/api/column_analysis/transform/${currentDatasetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    column: currentColumn.name,
                    transformation_type: transformationType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to transform column');
            }

            const data = await response.json();
            if (data.success && data.transformation_analysis) {
                const analysis = data.transformation_analysis;
                let resultHtml = `
                    <div class="action-result">
                        <h5>🔄 Transform Analysis: ${analysis.column}</h5>
                        <p><strong>Method:</strong> ${analysis.method}</p>
                        <p><strong>Description:</strong> ${analysis.description}</p>
                        
                        <h6>Original Statistics:</h6>
                        <div class="stats-mini-grid">
                            <div class="mini-stat">Mean: ${safeFormat(analysis.original_stats.mean)}</div>
                            <div class="mini-stat">Std: ${safeFormat(analysis.original_stats.std)}</div>
                            <div class="mini-stat">Min: ${safeFormat(analysis.original_stats.min)}</div>
                            <div class="mini-stat">Max: ${safeFormat(analysis.original_stats.max)}</div>
                            <div class="mini-stat">Skewness: ${safeFormat(analysis.original_stats.skewness)}</div>
                        </div>
                        
                        <p><strong>Recommendation:</strong> ${analysis.recommendation}</p>
                        <p class="status-success">✅ ${data.message}</p>
                    </div>
                `;
                showResultModal('Transform Analysis', resultHtml);
            } else {
                throw new Error(data.error || 'Transform failed');
            }
        } catch (error) {
            console.error('Transform error:', error);
            showError('Failed to transform column: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    async function handleCleanColumn() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const cleaningOptions = {
            remove_nulls: confirm('Remove null values?'),
            remove_duplicates: confirm('Remove duplicate values?'),
            remove_outliers: confirm('Remove outliers?')
        };

        showLoading();
        try {
            const response = await fetch(`/api/column_analysis/clean/${currentDatasetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    column: currentColumn.name,
                    options: cleaningOptions
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to clean column');
            }

            const data = await response.json();
            if (data.success && data.cleaning_analysis) {
                const analysis = data.cleaning_analysis;
                let resultHtml = `
                    <div class="action-result">
                        <h5>🧹 Cleaning Analysis: ${analysis.column}</h5>
                        
                        <div class="cleaning-stats">
                            <div class="stats-mini-grid">
                                <div class="mini-stat">Original Records: ${analysis.original_count.toLocaleString()}</div>
                                <div class="mini-stat">Records to Remove: ${analysis.records_to_remove.toLocaleString()}</div>
                                <div class="mini-stat">Remaining Records: ${analysis.remaining_count.toLocaleString()}</div>
                                <div class="mini-stat impact-${analysis.impact_percentage > 20 ? 'high' : analysis.impact_percentage > 10 ? 'medium' : 'low'}">
                                    Impact: ${analysis.impact_percentage}%
                                </div>
                            </div>
                        </div>
                        
                        <h6>Cleaning Actions:</h6>
                        <ul class="cleaning-actions">
                            ${analysis.cleaning_actions.map(action => `<li>📋 ${action}</li>`).join('')}
                        </ul>
                        
                        <p><strong>⚠️ Recommendation:</strong> ${analysis.recommendation}</p>
                        <p class="status-success">✅ ${data.message}</p>
                    </div>
                `;
                showResultModal('Cleaning Analysis', resultHtml);
            } else {
                throw new Error(data.error || 'Cleaning failed');
            }
        } catch (error) {
            console.error('Clean error:', error);
            showError('Failed to clean column: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    async function handleEncodeColumn() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const encodingType = prompt('Enter encoding type (label, onehot, target, ordinal):') || 'label';

        showLoading();
        try {
            const response = await fetch(`/api/column_analysis/encode/${currentDatasetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    column: currentColumn.name,
                    encoding_type: encodingType
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to encode column');
            }

            const data = await response.json();
            if (data.success && data.encoding_analysis) {
                const analysis = data.encoding_analysis;
                let resultHtml = `
                    <div class="action-result">
                        <h5>🔤 Encoding Analysis: ${analysis.column}</h5>
                        <p><strong>Method:</strong> ${analysis.encoding_method}</p>
                        
                        <h6>Column Information:</h6>
                        <div class="stats-mini-grid">
                            <div class="mini-stat">Unique Values: ${analysis.column_info.unique_values}</div>
                            <div class="mini-stat">Most Frequent: ${analysis.column_info.most_frequent || 'N/A'}</div>
                            <div class="mini-stat">Data Type: ${analysis.column_info.data_type}</div>
                        </div>
                        
                        <h6>Encoding Details:</h6>
                        <p><strong>Description:</strong> ${analysis.encoding_details.description}</p>
                        <p><strong>Suitable For:</strong> ${analysis.encoding_details.suitable_for}</p>
                        <p><strong>Output Columns:</strong> ${analysis.encoding_details.output_columns}</p>
                        <p><strong>Memory Efficient:</strong> ${analysis.encoding_details.memory_efficient ? '✅ Yes' : '❌ No'}</p>
                        
                        <h6>Recommendations:</h6>
                        <ul class="recommendations-list">
                            ${analysis.recommendations.map(rec => `<li>💡 ${rec}</li>`).join('')}
                        </ul>
                        
                        <p class="status-success">✅ ${data.message}</p>
                    </div>
                `;
                showResultModal('Encoding Analysis', resultHtml);
            } else {
                throw new Error(data.error || 'Encoding failed');
            }
        } catch (error) {
            console.error('Encode error:', error);
            showError('Failed to encode column: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    async function handleExportAnalysis() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        showLoading();
        try {
            const response = await fetch(`/api/column_analysis/export/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&format=json`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to export analysis');
            }

            const data = await response.json();
            if (data.success && data.export_info) {
                const exportInfo = data.export_info;
                let resultHtml = `
                    <div style="background: white; border: 3px solid #007cba; border-radius: 8px; padding: 0; margin: 20px 0; font-family: Arial, sans-serif; overflow: hidden;">
                        <!-- ATTRACTIVE BANNER -->
                        <div style="background: linear-gradient(135deg, #007cba 0%, #005580 50%, #003d5c 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
                            <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.1); border-radius: 50%; transform: rotate(45deg);"></div>
                            <div style="position: absolute; bottom: -30px; left: -30px; width: 150px; height: 150px; background: rgba(255,255,255,0.08); border-radius: 50%;"></div>
                            <div style="position: relative; z-index: 2;">
                                <h2 style="color: white; font-size: 32px; margin: 0 0 15px 0; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                                    📊 Export Analysis: ${exportInfo.column}
                                </h2>
                                <div style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); border-radius: 25px; padding: 15px 30px; display: inline-block; margin: 10px 0;">
                                    <p style="color: white; font-size: 18px; margin: 0; font-weight: 500; text-shadow: 1px 1px 2px rgba(0,0,0,0.2);">
                                        📁 Format: <strong>${exportInfo.format.toUpperCase()}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- MAIN CONTENT -->
                        <div style="padding: 30px;">
                            <!-- EXPORT STATISTICS -->
                            <div style="background: #f0f8ff; border: 2px solid #007cba; border-radius: 8px; padding: 25px; margin: 20px 0;">
                                <h3 style="color: #007cba; font-size: 20px; margin: 0 0 20px 0;">📊 Export Statistics</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                                    <div style="background: white; padding: 20px; border: 2px solid #007cba; border-radius: 8px; text-align: center;">
                                        <h4 style="color: #005580; margin: 0 0 10px 0; font-size: 16px;">Completed Sections</h4>
                                        <p style="font-size: 32px; font-weight: bold; color: #007cba; margin: 0;">${exportInfo.export_stats.completed_sections}/${exportInfo.export_stats.total_sections}</p>
                                    </div>
                                    <div style="background: white; padding: 20px; border: 2px solid #007cba; border-radius: 8px; text-align: center;">
                                        <h4 style="color: #005580; margin: 0 0 10px 0; font-size: 16px;">Data Points</h4>
                                        <p style="font-size: 32px; font-weight: bold; color: #007cba; margin: 0;">${exportInfo.export_stats.data_points_analyzed.toLocaleString()}</p>
                                    </div>
                                    <div style="background: white; padding: 20px; border: 2px solid #007cba; border-radius: 8px; text-align: center;">
                                        <h4 style="color: #005580; margin: 0 0 10px 0; font-size: 16px;">Completeness</h4>
                                        <p style="font-size: 32px; font-weight: bold; color: #007cba; margin: 0;">${exportInfo.export_stats.analysis_completeness}%</p>
                                    </div>
                                    <div style="background: white; padding: 20px; border: 2px solid #007cba; border-radius: 8px; text-align: center;">
                                        <h4 style="color: #005580; margin: 0 0 10px 0; font-size: 16px;">File Size</h4>
                                        <p style="font-size: 32px; font-weight: bold; color: #007cba; margin: 0;">${exportInfo.file_size_estimate}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- DOWNLOAD SECTION -->
                            <div style="background: #e8f5e8; border: 2px solid #4caf50; border-radius: 8px; padding: 25px; margin: 20px 0;">
                                <h3 style="color: #4caf50; font-size: 20px; margin: 0 0 20px 0;">💾 Download Options</h3>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                                    <div style="background: white; padding: 20px; border: 2px solid #4caf50; border-radius: 8px;">
                                        <h4 style="color: #388e3c; margin: 0 0 15px 0;">📋 Analysis Report</h4>
                                        <p style="margin: 10px 0; color: #666;">Complete analysis report including statistics, patterns, and recommendations.</p>
                                        <button onclick="downloadJsonData('${exportInfo.column}_analysis.json', ${JSON.stringify(JSON.stringify(data.export_data))})" 
                                                style="background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; margin-top: 10px;">
                                            📄 Download Analysis Report
                                        </button>
                                    </div>
                                    <div style="background: white; padding: 20px; border: 2px solid #4caf50; border-radius: 8px;">
                                        <h4 style="color: #388e3c; margin: 0 0 15px 0;">🧹 Cleaned Data</h4>
                                        <p style="margin: 10px 0; color: #666;">Dataset with outliers, missing values, and anomalies handled based on recommendations.</p>
                                        <button onclick="downloadCleanedData('${exportInfo.column}', ${currentDatasetId})" 
                                                style="background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; border: none; padding: 12px 24px; border-radius: 25px; font-weight: bold; cursor: pointer; transition: all 0.3s ease; margin-top: 10px;">
                                            🧹 Download Cleaned Data
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- SUCCESS MESSAGE -->
                            <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <h4 style="color: #4caf50; margin: 0 0 10px 0;">✅ Export Ready</h4>
                                <p style="margin: 0; color: #666;">${data.message}</p>
                            </div>
                        </div>
                    </div>
                `;
                showResultModal('Export Analysis', resultHtml);
            } else {
                throw new Error(data.error || 'Export failed');
            }
        } catch (error) {
            console.error('Export error:', error);
            showError('Failed to export analysis: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    // Add function to download cleaned data
    async function downloadCleanedData(columnName, datasetId) {
        try {
            showLoading();
            
            // Get the comprehensive analysis to understand what needs to be cleaned
            const analysisResponse = await fetch(`/api/column_analysis/export/${datasetId}?column=${encodeURIComponent(columnName)}&format=json`);
            if (!analysisResponse.ok) throw new Error('Failed to fetch analysis data');
            
            const analysisData = await analysisResponse.json();
            
            // Create cleaned data recommendations
            const cleaningOptions = {
                remove_nulls: true,
                remove_duplicates: true,
                remove_outliers: false, // Conservative approach
                impute_missing: true
            };
            
            // Simulate cleaned data export (in a real scenario, this would call a backend endpoint)
            const cleanedDataInfo = {
                column: columnName,
                dataset_id: datasetId,
                original_rows: analysisData.export_data?.column_analysis?.basic_statistics?.count || 0,
                cleaning_applied: [
                    'Removed null values',
                    'Removed duplicate entries',
                    'Applied recommended transformations'
                ],
                timestamp: new Date().toISOString()
            };
            
            downloadJsonData(`${columnName}_cleaned_data.json`, cleanedDataInfo);
            
            showMessage('Success', 'success', 'Cleaned data export initiated. In a production environment, this would provide the actual cleaned dataset.');
            
        } catch (error) {
            console.error('Cleaned data export error:', error);
            showError('Failed to export cleaned data: ' + error.message);
        } finally {
            hideLoading();
        }
    }
});

// Global functions that need to be accessible from HTML
window.closeResultModal = function() {
    const modal = document.getElementById('result-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.downloadJsonData = function(filename, data) {
    try {
        const jsonData = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showMessage('Success', 'success', `File ${filename} downloaded successfully!`);
    } catch (error) {
        console.error('Download error:', error);
        showError('Failed to download file: ' + error.message);
    }
};

// Global utility functions
function safeFormat(value, decimals = 3) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }
    return typeof value === 'number' ? value.toFixed(decimals) : value;
}

// Global functions exposed to window for HTML onclick handlers
window.showDistributionChart = async function(chartType) {
    if (!currentDatasetId || !currentColumn) {
        alert('Please select a dataset and column first.');
        return;
    }

    const chartContainer = document.getElementById('distribution-content');
    if (!chartContainer) {
        alert('Chart container not found. Please analyze the column first.');
        return;
    }

    // Show loading
    const loadingModal = document.getElementById('column-loading-modal');
    if (loadingModal) loadingModal.style.display = 'flex';
    
    try {
        // Use backend chart generation
        const response = await fetch(`/api/column_analysis/generate_chart/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&chart_type=${chartType}`);
        if (!response.ok) throw new Error('Failed to generate chart');
        const data = await response.json();

        if (data.success && data.chart) {
            chartContainer.innerHTML = data.chart.chart_html;
        } else {
            throw new Error(data.chart?.error || 'Failed to generate chart');
        }
    } catch (error) {
        console.error('Chart generation error:', error);
        chartContainer.innerHTML = '<div class="error-message">Failed to generate chart: ' + error.message + '</div>';
    } finally {
        // Hide loading
        if (loadingModal) loadingModal.style.display = 'none';
    }
};

// Global chart generation functions
function generateHistogramChart(distributionData, dataType) {
    if (dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float'))) {
        // Numeric histogram simulation
        const mean = distributionData.mean || 0;
        const std = distributionData.std || 1;
        const min = distributionData.min || 0;
        const max = distributionData.max || 100;
        
        return `
            <div class="chart-result">
                <h6>📊 Histogram - ${currentColumn?.name || 'Unknown Column'}</h6>
                <div class="histogram-chart">
                    <div class="histogram-info">
                        <p><strong>Data Range:</strong> ${safeFormat(min)} to ${safeFormat(max)}</p>
                        <p><strong>Mean:</strong> ${safeFormat(mean)} | <strong>Std Dev:</strong> ${safeFormat(std)}</p>
                    </div>
                    <div class="histogram-bars">
                        ${generateGlobalHistogramBars(distributionData)}
                    </div>
                    <div class="histogram-labels">
                        <span>Min (${safeFormat(min)})</span>
                        <span>Mean (${safeFormat(mean)})</span>
                        <span>Max (${safeFormat(max)})</span>
                    </div>
                </div>
                <div class="chart-interpretation">
                    <h6>📈 Interpretation:</h6>
                    <p>${interpretGlobalHistogram(distributionData)}</p>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="chart-result">
                <h6>📊 Histogram - ${currentColumn?.name || 'Unknown Column'}</h6>
                <p class="chart-note">Histogram is not applicable for categorical data. Use Value Counts instead.</p>
                <button onclick="showDistributionChart('value_counts')" class="btn btn-primary">Show Value Counts</button>
            </div>
        `;
    }
}

function generateBoxPlotChart(distributionData, dataType) {
    if (dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float'))) {
        const q1 = distributionData.q1 || (distributionData.mean - distributionData.std);
        const q2 = distributionData.median || distributionData.mean;
        const q3 = distributionData.q3 || (distributionData.mean + distributionData.std);
        const min = distributionData.min || 0;
        const max = distributionData.max || 100;
        
        return `
            <div class="chart-result">
                <h6>📦 Box Plot - ${currentColumn?.name || 'Unknown Column'}</h6>
                <div class="boxplot-chart">
                    <div class="boxplot-container">
                        ${generateGlobalBoxPlotVisualization(min, q1, q2, q3, max)}
                    </div>
                    <div class="boxplot-stats">
                        <div class="boxplot-stat">
                            <strong>Min:</strong> ${safeFormat(min)}
                        </div>
                        <div class="boxplot-stat">
                            <strong>Q1:</strong> ${safeFormat(q1)}
                        </div>
                        <div class="boxplot-stat">
                            <strong>Median:</strong> ${safeFormat(q2)}
                        </div>
                        <div class="boxplot-stat">
                            <strong>Q3:</strong> ${safeFormat(q3)}
                        </div>
                        <div class="boxplot-stat">
                            <strong>Max:</strong> ${safeFormat(max)}
                        </div>
                    </div>
                </div>
                <div class="chart-interpretation">
                    <h6>📊 Interpretation:</h6>
                    <p>${interpretGlobalBoxPlot(distributionData)}</p>
                </div>
            </div>
        `;
    } else {
        return `
            <div class="chart-result">
                <h6>📦 Box Plot - ${currentColumn?.name || 'Unknown Column'}</h6>
                <p class="chart-note">Box Plot is not applicable for categorical data. Use Value Counts instead.</p>
                <button onclick="showDistributionChart('value_counts')" class="btn btn-primary">Show Value Counts</button>
            </div>
        `;
    }
}

function generateValueCountsChart(distributionData, dataType) {
    const valueCounts = distributionData.value_counts || {};
    const totalCount = distributionData.count || Object.values(valueCounts).reduce((a, b) => a + b, 0) || 1;
    
    return `
        <div class="chart-result">
            <h6>📊 Value Counts - ${currentColumn?.name || 'Unknown Column'}</h6>
            <div class="value-counts-chart">
                <div class="value-counts-header">
                    <span>Value</span>
                    <span>Count</span>
                    <span>Percentage</span>
                    <span>Bar</span>
                </div>
                ${generateGlobalValueCountsBars(valueCounts, totalCount)}
            </div>
            <div class="chart-interpretation">
                <h6>📈 Summary:</h6>
                <p>Showing top ${Object.keys(valueCounts).length} values. 
                ${dataType && (dataType.toLowerCase().includes('int') || dataType.toLowerCase().includes('float')) ? 
                    'This shows the frequency distribution of values in the numeric column.' : 
                    'This shows the frequency distribution of categories.'}</p>
            </div>
        </div>
    `;
}

function generateGlobalHistogramBars(distributionData) {
    // Simulate histogram bars based on statistical properties
    const bars = [];
    const mean = distributionData.mean || 0;
    const std = distributionData.std || 1;
    const skewness = distributionData.skewness || 0;
    
    // Generate 10 bars representing the distribution
    for (let i = 0; i < 10; i++) {
        const position = i / 9; // 0 to 1
        let height;
        
        if (Math.abs(skewness) < 0.5) {
            // Normal-like distribution
            height = Math.exp(-Math.pow((position - 0.5) * 4, 2)) * 100;
        } else if (skewness > 0) {
            // Right-skewed
            height = Math.exp(-Math.pow((position - 0.2) * 3, 2)) * 100;
        } else {
            // Left-skewed
            height = Math.exp(-Math.pow((position - 0.8) * 3, 2)) * 100;
        }
        
        bars.push(`<div class="histogram-bar" style="height: ${height}%; background: linear-gradient(to top, #3b82f6, #60a5fa);"></div>`);
    }
    
    return bars.join('');
}

function generateGlobalBoxPlotVisualization(min, q1, median, q3, max) {
    return `
        <div class="boxplot-visual">
            <div class="boxplot-whisker-left" style="left: 0%; width: 20%;"></div>
            <div class="boxplot-box" style="left: 20%; width: 60%;">
                <div class="boxplot-median" style="left: 50%;"></div>
            </div>
            <div class="boxplot-whisker-right" style="left: 80%; width: 20%;"></div>
            <div class="boxplot-labels">
                <span style="left: 0%;">Min</span>
                <span style="left: 20%;">Q1</span>
                <span style="left: 50%;">Median</span>
                <span style="left: 80%;">Q3</span>
                <span style="left: 100%;">Max</span>
            </div>
        </div>
    `;
}

function generateGlobalValueCountsBars(valueCounts, totalCount) {
    const entries = Object.entries(valueCounts).slice(0, 20); // Top 20 values
    const maxCount = Math.max(...Object.values(valueCounts));
    
    return entries.map(([value, count]) => {
        const percentage = ((count / totalCount) * 100).toFixed(1);
        const barWidth = (count / maxCount) * 100;
        
        return `
            <div class="value-count-row">
                <span class="value-label">${value}</span>
                <span class="count-value">${count.toLocaleString()}</span>
                <span class="percentage-value">${percentage}%</span>
                <div class="count-bar-container">
                    <div class="count-bar" style="width: ${barWidth}%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
                </div>
            </div>
        `;
    }).join('');
}

function interpretGlobalHistogram(distributionData) {
    const skewness = distributionData.skewness || 0;
    const kurtosis = distributionData.kurtosis || 0;
    
    let interpretation = '';
    
    if (Math.abs(skewness) < 0.5) {
        interpretation += 'The distribution appears approximately symmetric. ';
    } else if (skewness > 0.5) {
        interpretation += 'The distribution is right-skewed with a longer tail extending to higher values. ';
    } else {
        interpretation += 'The distribution is left-skewed with a longer tail extending to lower values. ';
    }
    
    if (Math.abs(kurtosis) < 1) {
        interpretation += 'The tail behavior is similar to a normal distribution.';
    } else if (kurtosis > 1) {
        interpretation += 'The distribution has heavy tails with more extreme values than expected.';
    } else {
        interpretation += 'The distribution has light tails with fewer extreme values.';
    }
    
    return interpretation;
}

function interpretGlobalBoxPlot(distributionData) {
    const median = distributionData.median || distributionData.mean || 0;
    const mean = distributionData.mean || 0;
    const skewness = distributionData.skewness || 0;
    
    let interpretation = `The median value is ${safeFormat(median)}. `;
    
    if (Math.abs(mean - median) > (distributionData.std || 1) * 0.5) {
        interpretation += 'There is a notable difference between mean and median, suggesting skewness. ';
    }
    
    if (Math.abs(skewness) > 0.5) {
        interpretation += skewness > 0 ? 
            'The distribution is skewed right, with outliers likely in the upper range. ' :
            'The distribution is skewed left, with outliers likely in the lower range. ';
    } else {
        interpretation += 'The distribution appears relatively balanced. ';
    }
    
    return interpretation;
}