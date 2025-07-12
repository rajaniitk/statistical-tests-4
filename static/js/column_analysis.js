// Global variables (moved outside DOMContentLoaded for global access)
let currentDatasetId = null;
let currentColumns = []; // Stores { name: 'col_name', type: 'dtype' }
let currentColumn = null; // Stores the selected column's full info object

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const datasetSelect = document.getElementById('column-dataset-select');
    const columnSelect = document.getElementById('column-select');
    const columnSelector = document.getElementById('column-selector');
    const columnOverview = document.getElementById('column-overview');
    const analysisTabs = document.getElementById('analysis-tabs');
    const columnActions = document.getElementById('column-actions');
    const loadingModal = document.getElementById('column-loading-modal');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize
    setupEventListeners();
    loadDatasets();
    
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
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }

    .overview-card:hover {
        transform: translateY(-2px);
    }

    .overview-card h4 {
        color: #495057;
        margin-bottom: 10px;
        font-size: 0.9em;
        font-weight: 600;
    }

    .overview-card span {
        color: #2c3e50;
        font-size: 1.3em;
        font-weight: bold;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }

    .stat-item {
        background: white;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #007bff;
    }

    .stat-item strong {
        display: block;
        color: #6c757d;
        font-size: 0.85em;
        margin-bottom: 5px;
    }

    .stat-item span {
        color: #2c3e50;
        font-size: 1.1em;
        font-weight: 600;
    }

    .distribution-controls {
        margin: 20px 0;
        text-align: center;
    }

    .distribution-controls .btn {
        margin: 0 10px;
        padding: 10px 20px;
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .distribution-controls .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    }

    .chart-content {
        min-height: 400px;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .error-message {
        background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        text-align: center;
    }

    .pattern-result, .quality-metric {
        background: white;
        padding: 20px;
        border-radius: 12px;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .interpretation-item {
        background: #f8f9fa;
        padding: 10px;
        margin: 8px 0;
        border-left: 4px solid #28a745;
        border-radius: 4px;
    }

    /* Modal Styling */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 12px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        position: relative;
    }

    .result-modal-content {
        max-width: 800px;
        text-align: left;
        padding: 0;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 30px;
        border-bottom: 1px solid #e2e8f0;
        margin-bottom: 20px;
    }

    .modal-header h4 {
        margin: 0;
        color: #1e293b;
        font-size: 1.5em;
        font-weight: 600;
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
        padding: 0 30px 30px 30px;
    }

    /* Transform, Clean, Encode Modal Styling */
    .analysis-result {
        background: white;
        padding: 25px;
        border-radius: 12px;
        margin: 20px 0;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #007bff;
    }

    .analysis-result h5 {
        color: #1e293b;
        margin-bottom: 15px;
        font-size: 1.2em;
        font-weight: 600;
    }

    .analysis-result p {
        color: #64748b;
        margin-bottom: 10px;
        line-height: 1.6;
    }

    .analysis-result strong {
        color: #1e293b;
        font-weight: 600;
    }

    .analysis-summary {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 20px;
        border-radius: 8px;
        margin: 15px 0;
        border: 1px solid #e2e8f0;
    }

    .analysis-summary h6 {
        color: #1e293b;
        margin-bottom: 10px;
        font-size: 1em;
        font-weight: 600;
    }

    .analysis-summary ul {
        margin: 10px 0;
        padding-left: 20px;
    }

    .analysis-summary li {
        color: #64748b;
        margin-bottom: 5px;
        line-height: 1.5;
    }

    .stats-summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        margin: 15px 0;
    }

    .stat-summary-item {
        background: white;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #28a745;
    }

    .stat-summary-item strong {
        display: block;
        color: #6c757d;
        font-size: 0.8em;
        margin-bottom: 5px;
    }

    .stat-summary-item span {
        color: #2c3e50;
        font-size: 1.1em;
        font-weight: 600;
    }

    .recommendation-box {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        padding: 20px;
        border-radius: 8px;
        margin: 15px 0;
        border-left: 4px solid #3b82f6;
    }

    .recommendation-box h6 {
        color: #1e40af;
        margin-bottom: 10px;
        font-size: 1em;
        font-weight: 600;
    }

    .recommendation-box p {
        color: #1e40af;
        margin-bottom: 5px;
        line-height: 1.5;
    }

    .status-badge {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .status-badge.success {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #166534;
    }

    .status-badge.warning {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #92400e;
    }

    .status-badge.info {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
        color: #1e40af;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-block;
    }

    .btn-primary {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
    }

    .btn-secondary {
        background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
        color: white;
    }

    .btn-success {
        background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        color: white;
    }

    .btn-warning {
        background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
        color: #212529;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .tab-button {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #495057;
        padding: 12px 24px;
        margin: 0 5px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s;
    }

    .tab-button.active {
        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
        color: white;
        border-color: #007bff;
    }

    .tab-content {
        display: none;
        padding: 20px;
        background: white;
        border-radius: 12px;
        margin-top: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .tab-content.active {
        display: block;
    }

    /* Export Modal Styling */
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
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s ease;
    }

    .quality-metric:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
    .relationship-result, .outlier-result, .trends-result {
        background: white;
        padding: 20px;
        border-radius: 12px;
        border-left: 4px solid #3b82f6;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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

    /* Transformation Section Styling */
    .transformation-sections {
        display: grid;
        grid-template-columns: 1fr;
        gap: 25px;
        margin-top: 20px;
    }

    .transformation-section {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #e2e8f0;
    }

    .section-header {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
    }

    .section-header h5 {
        margin: 0;
        color: #1e293b;
        font-size: 1.1em;
        font-weight: 600;
    }

    .transformation-controls, .cleaning-controls, .encoding-controls, .export-controls {
        display: flex;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
    }

    .cleaning-options {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
    }

    .cleaning-options label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #64748b;
        font-size: 0.9em;
        cursor: pointer;
    }

    .cleaning-options input[type="checkbox"] {
        width: 16px;
        height: 16px;
        accent-color: #3b82f6;
    }

    .section-content {
        padding: 25px;
        min-height: 120px;
    }

    .form-control {
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 0.9em;
        min-width: 150px;
        background: white;
    }

    .form-control:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .encoding-preview {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 10px;
        margin-top: 10px;
    }

    .mapping-item {
        background: #f8f9fa;
        padding: 10px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.9em;
    }

    .mapping-item .original {
        color: #495057;
        font-weight: 500;
    }

    .mapping-item .encoded {
        color: #007bff;
        font-weight: 600;
    }

    /* Responsive design for transformation section */
    @media (max-width: 768px) {
        .section-header {
            flex-direction: column;
            align-items: stretch;
        }
        
        .transformation-controls, .cleaning-controls, .encoding-controls, .export-controls {
            flex-direction: column;
            align-items: stretch;
        }
        
        .cleaning-options {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
        }
        
        .form-control {
            width: 100%;
        }
    }
    </style>
    `;
    
    // Inject the CSS
    document.head.insertAdjacentHTML('beforeend', columnAnalysisCSS);

    // Global variables
    let currentDatasetId = null;
    let currentColumn = null;
    let currentColumns = [];
    let currentAnalysis = null;

    // Initialize
    loadDatasets();
    setupEventListeners();
    
    // Utility function to safely format numbers
    function safeFormat(value, decimals = 3) {
        if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
        }
        return typeof value === 'number' ? value.toFixed(decimals) : String(value);
    }

    function setupEventListeners() {
        // Dataset selection
        datasetSelect.addEventListener('change', handleDatasetSelection);
        document.getElementById('refresh-column-datasets').addEventListener('click', loadDatasets);

        // Column selection
        columnSelect.addEventListener('change', handleColumnSelection);
        document.getElementById('analyze-column').addEventListener('click', analyzeColumn);

        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', function() {
                const tabName = this.getAttribute('data-tab');
                switchTab(tabName);
            });
        });

        // Relationship analysis
        document.getElementById('analyze-relationship').addEventListener('click', analyzeRelationship);

        // Transformation section event listeners
        document.getElementById('run-transformation').addEventListener('click', runTransformationAnalysis);
        document.getElementById('run-cleaning').addEventListener('click', runCleaningAnalysis);
        document.getElementById('run-encoding').addEventListener('click', runEncodingAnalysis);
        document.getElementById('export-analysis').addEventListener('click', exportAnalysisData);
        document.getElementById('export-cleaned-data').addEventListener('click', exportCleanedDataInfo);

        // Quick action buttons
        document.getElementById('quick-transform').addEventListener('click', quickTransform);
        document.getElementById('quick-clean').addEventListener('click', quickClean);
        document.getElementById('quick-export').addEventListener('click', quickExport);
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

    // displayDistribution function removed - replaced by transformation section

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
        
        const container = document.getElementById('outlier-detection');
        if (!container) return;
        
        // Show loading state
        container.innerHTML = '<p>Loading outlier analysis...</p>';
        
        try {
            // Fetch outliers for the current column
            const response = await fetch(`/api/column_analysis/outliers/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&method=iqr`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Outlier response:', data); // Debug log

            if (data.success && data.outliers && data.outliers.outlier_detection) {
                // Use the IQR method data from the correct structure
                const outlierDetection = data.outliers.outlier_detection;
                const iqrData = outlierDetection.iqr_method || outlierDetection.iqr;
                
                if (iqrData && !iqrData.error) {
                    const percentage = safeFormat(iqrData.percentage, 1);
                    const lowerBound = safeFormat(iqrData.lower_bound, 2);
                    const upperBound = safeFormat(iqrData.upper_bound, 2);
                    
                    container.innerHTML = `
                        <div class="outlier-result">
                            <h6>⚠️ Outlier Detection Results</h6>
                            <p><strong>${iqrData.count || 0} potential outliers detected</strong> (${percentage}% of data)</p>
                            <p><strong>Method:</strong> IQR (Interquartile Range)</p>
                            <p><strong>Bounds:</strong> ${lowerBound} to ${upperBound}</p>
                            <p><strong>Recommendation:</strong> Consider investigating and handling these values if they appear to be data errors.</p>
                        </div>
                    `;
                } else {
                    container.innerHTML = `
                        <div class="outlier-result">
                            <h6>⚠️ Outlier Detection</h6>
                            <p>Outlier detection not applicable for this column type.</p>
                        </div>
                    `;
                }
            } else if (data.error) {
                container.innerHTML = `<p class="error-message">Error: ${data.error}</p>`;
            } else {
                container.innerHTML = `
                    <div class="outlier-result">
                        <h6>⚠️ Outlier Detection</h6>
                        <p>Could not fetch outlier information. Please try again.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error fetching outlier info:", error);
            container.innerHTML = `<p class="error-message">Failed to load outlier analysis: ${error.message}</p>`;
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
            document.getElementById('transformation-results').innerHTML = '<p>Select a transformation type and click "Analyze Transformation" to see the analysis.</p>';
            document.getElementById('cleaning-results').innerHTML = '<p>Configure cleaning options and click "Analyze Cleaning Impact" to see the impact analysis.</p>';
            document.getElementById('encoding-results').innerHTML = '<p>Select an encoding type and click "Analyze Encoding" to see the encoding analysis.</p>';
            document.getElementById('export-results').innerHTML = '<p>Select export format and click the appropriate export button to download data.</p>';
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
            case 'transformation':
                // Transformation section is ready for user interaction
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
            modal.innerHTML = `<div id="result-modal-content-wrapper"></div>`;
            document.body.appendChild(modal);
        }
        
        // If the content already has the full modal structure, use it directly
        if (content.includes('result-modal-content')) {
            document.getElementById('result-modal-content-wrapper').innerHTML = content;
        } else {
            // Fallback for simple content
            document.getElementById('result-modal-content-wrapper').innerHTML = `
                <div class="modal-content result-modal-content">
                    <div class="modal-header">
                        <h4>${title}</h4>
                        <button onclick="closeResultModal()" class="modal-close">×</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            `;
        }
        
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

    async function fetchPatternsData() {
        if (!currentDatasetId || !currentColumn) return;

        try {
            const response = await fetch(`/api/column_analysis/patterns/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}`);
            if (!response.ok) throw new Error('Failed to fetch patterns data');
            const data = await response.json();

            if (data.success && data.patterns) {
                const patternsData = data.patterns;
                const container = document.getElementById('value-patterns');
                let html = '<div class="pattern-result">';
                html += '<h6>🔍 Pattern Analysis</h6>';
                
                if (patternsData.string_patterns && Object.keys(patternsData.string_patterns).length > 0) {
                    html += '<p><strong>String Patterns:</strong></p>';
                    html += `<p>Average Length: ${safeFormat(patternsData.string_patterns.average_length, 1)} characters</p>`;
                    html += `<p>Contains Numbers: ${patternsData.string_patterns.contains_numbers ? 'Yes' : 'No'}</p>`;
                    html += `<p>Contains Special Characters: ${patternsData.string_patterns.contains_special_chars ? 'Yes' : 'No'}</p>`;
                }
                
                if (patternsData.numerical_patterns && Object.keys(patternsData.numerical_patterns).length > 0) {
                    html += '<p><strong>Numerical Patterns:</strong></p>';
                    html += `<p>Mean: ${safeFormat(patternsData.numerical_patterns.mean)}</p>`;
                    html += `<p>Standard Deviation: ${safeFormat(patternsData.numerical_patterns.std)}</p>`;
                }
                
                html += '</div>';
                container.innerHTML = html;
            }
        } catch (error) {
            console.error("Error fetching patterns data:", error);
            document.getElementById('value-patterns').innerHTML = '<p>Could not fetch pattern data.</p>';
        }
    }

    async function fetchQualityData() {
        if (!currentDatasetId || !currentColumn) return;

        try {
            const response = await fetch(`/api/column_analysis/data_quality/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}`);
            if (!response.ok) throw new Error('Failed to fetch quality data');
            const data = await response.json();

            if (data.success && data.quality) {
                const qualityData = data.quality;
                displayQuality(qualityData);
            }
        } catch (error) {
            console.error("Error fetching quality data:", error);
            document.getElementById('completeness-analysis').innerHTML = '<p>Could not fetch quality data.</p>';
            document.getElementById('consistency-analysis').innerHTML = '<p>Could not fetch quality data.</p>';
            document.getElementById('validity-analysis').innerHTML = '<p>Could not fetch quality data.</p>';
        }
    }

    // --- Distribution Chart Functions ---
    // Distribution chart functions removed - replaced by transformation section

    // Old chart generation functions removed - replaced by transformation section

    // === TRANSFORMATION SECTION FUNCTIONS ===

    // === TRANSFORMATION SECTION FUNCTIONS ===

    async function runTransformationAnalysis() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const transformationType = document.getElementById('transformation-type').value;
        const resultsContainer = document.getElementById('transformation-results');
        
        resultsContainer.innerHTML = '<div class="loading-spinner"></div><p>Analyzing transformation...</p>';

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
                throw new Error(errorData.error || 'Failed to analyze transformation');
            }

            const data = await response.json();
            if (data.success && data.transformation_analysis) {
                const analysis = data.transformation_analysis;
                resultsContainer.innerHTML = `
                    <div class="analysis-result">
                        <h6>📊 Transformation Analysis Results</h6>
                        <div class="analysis-summary">
                            <p><strong>Method:</strong> ${analysis.method}</p>
                            <p><strong>Description:</strong> ${analysis.description}</p>
                            <span class="status-badge ${analysis.status === 'analysis_completed' ? 'success' : 'info'}">${analysis.status}</span>
                        </div>
                        
                        <div class="stats-summary">
                            <div class="stat-summary-item">
                                <strong>Original Mean</strong>
                                <span>${safeFormat(analysis.original_stats.mean)}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Original Std</strong>
                                <span>${safeFormat(analysis.original_stats.std)}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Skewness</strong>
                                <span>${safeFormat(analysis.original_stats.skewness)}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Range</strong>
                                <span>${safeFormat(analysis.original_stats.min)} - ${safeFormat(analysis.original_stats.max)}</span>
                            </div>
                        </div>
                        
                        <div class="recommendation-box">
                            <h6>💡 Recommendation</h6>
                            <p>${analysis.recommendation}</p>
                        </div>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to get transformation analysis');
            }

        } catch (error) {
            console.error('Transformation analysis error:', error);
            resultsContainer.innerHTML = `<div class="error-message">Failed to analyze transformation: ${error.message}</div>`;
        }
    }

    async function runCleaningAnalysis() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const removeNulls = document.getElementById('remove-nulls').checked;
        const removeDuplicates = document.getElementById('remove-duplicates').checked;
        const removeOutliers = document.getElementById('remove-outliers').checked;
        const resultsContainer = document.getElementById('cleaning-results');
        
        resultsContainer.innerHTML = '<div class="loading-spinner"></div><p>Analyzing cleaning impact...</p>';

        try {
            const response = await fetch(`/api/column_analysis/clean/${currentDatasetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    column: currentColumn.name,
                    options: {
                        remove_nulls: removeNulls,
                        remove_duplicates: removeDuplicates,
                        remove_outliers: removeOutliers
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze cleaning');
            }

            const data = await response.json();
            if (data.success && data.cleaning_analysis) {
                const analysis = data.cleaning_analysis;
                resultsContainer.innerHTML = `
                    <div class="analysis-result">
                        <h6>🧹 Cleaning Impact Analysis</h6>
                        <div class="analysis-summary">
                            <p><strong>Impact:</strong> ${analysis.impact_percentage}% of data would be affected</p>
                            <span class="status-badge ${analysis.impact_percentage > 20 ? 'warning' : 'success'}">
                                ${analysis.impact_percentage > 20 ? 'High Impact' : 'Low Impact'}
                            </span>
                        </div>
                        
                        <div class="stats-summary">
                            <div class="stat-summary-item">
                                <strong>Original Count</strong>
                                <span>${analysis.original_count.toLocaleString()}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Records to Remove</strong>
                                <span>${analysis.records_to_remove.toLocaleString()}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Remaining Count</strong>
                                <span>${analysis.remaining_count.toLocaleString()}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Impact</strong>
                                <span>${analysis.impact_percentage}%</span>
                            </div>
                        </div>
                        
                        <div class="analysis-summary">
                            <h6>🛠️ Cleaning Actions</h6>
                            <ul>
                                ${analysis.cleaning_actions.map(action => `<li>${action}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="recommendation-box">
                            <h6>💡 Recommendation</h6>
                            <p>${analysis.recommendation}</p>
                        </div>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to get cleaning analysis');
            }

        } catch (error) {
            console.error('Cleaning analysis error:', error);
            resultsContainer.innerHTML = `<div class="error-message">Failed to analyze cleaning: ${error.message}</div>`;
        }
    }

    async function runEncodingAnalysis() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const encodingType = document.getElementById('encoding-type').value;
        const resultsContainer = document.getElementById('encoding-results');
        
        resultsContainer.innerHTML = '<div class="loading-spinner"></div><p>Analyzing encoding...</p>';

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
                throw new Error(errorData.error || 'Failed to analyze encoding');
            }

            const data = await response.json();
            if (data.success && data.encoding_analysis) {
                const analysis = data.encoding_analysis;
                resultsContainer.innerHTML = `
                    <div class="analysis-result">
                        <h6>🔤 Encoding Analysis Results</h6>
                        <div class="analysis-summary">
                            <p><strong>Method:</strong> ${analysis.encoding_method}</p>
                            <p><strong>Description:</strong> ${analysis.encoding_details.description}</p>
                            <span class="status-badge ${analysis.status === 'analysis_completed' ? 'success' : 'info'}">${analysis.status}</span>
                        </div>
                        
                        <div class="stats-summary">
                            <div class="stat-summary-item">
                                <strong>Unique Values</strong>
                                <span>${analysis.column_info.unique_values.toLocaleString()}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Most Frequent</strong>
                                <span>${analysis.column_info.most_frequent || 'N/A'}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Output Columns</strong>
                                <span>${analysis.encoding_details.output_columns}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Memory Efficient</strong>
                                <span>${analysis.encoding_details.memory_efficient ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                        
                        <div class="analysis-summary">
                            <h6>📋 Preview Mapping (Top 5)</h6>
                            <div class="encoding-preview">
                                ${Object.entries(analysis.preview_mapping).slice(0, 5).map(([key, value]) => 
                                    `<div class="mapping-item"><span class="original">${key}</span> → <span class="encoded">${value}</span></div>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="recommendation-box">
                            <h6>💡 Recommendations</h6>
                            ${analysis.recommendations.map(rec => `<p>• ${rec}</p>`).join('')}
                        </div>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to get encoding analysis');
            }

        } catch (error) {
            console.error('Encoding analysis error:', error);
            resultsContainer.innerHTML = `<div class="error-message">Failed to analyze encoding: ${error.message}</div>`;
        }
    }

    async function exportAnalysisData() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const exportFormat = document.getElementById('export-format').value;
        const resultsContainer = document.getElementById('export-results');
        
        resultsContainer.innerHTML = '<div class="loading-spinner"></div><p>Preparing export...</p>';

        try {
            const response = await fetch(`/api/column_analysis/export/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&format=${exportFormat}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to export analysis');
            }

            const data = await response.json();
            if (data.success && data.export_data) {
                // Create and download the file
                const filename = `${currentColumn.name}_analysis.${exportFormat}`;
                let fileContent;
                let mimeType;

                switch (exportFormat) {
                    case 'json':
                        fileContent = JSON.stringify(data.export_data, null, 2);
                        mimeType = 'application/json';
                        break;
                    case 'csv':
                        // Convert analysis data to CSV format
                        fileContent = convertToCSV(data.export_data);
                        mimeType = 'text/csv';
                        break;
                    case 'excel':
                        // For Excel, we'll export as JSON for now
                        fileContent = JSON.stringify(data.export_data, null, 2);
                        mimeType = 'application/json';
                        break;
                    default:
                        fileContent = JSON.stringify(data.export_data, null, 2);
                        mimeType = 'application/json';
                }

                downloadFile(filename, fileContent, mimeType);

                resultsContainer.innerHTML = `
                    <div class="analysis-result">
                        <h6>📤 Export Successful</h6>
                        <div class="analysis-summary">
                            <p><strong>File:</strong> ${filename}</p>
                            <p><strong>Format:</strong> ${exportFormat.toUpperCase()}</p>
                            <p><strong>Size:</strong> ${(fileContent.length / 1024).toFixed(2)} KB</p>
                            <span class="status-badge success">Downloaded</span>
                        </div>
                        
                        <div class="stats-summary">
                            <div class="stat-summary-item">
                                <strong>Total Sections</strong>
                                <span>${data.export_info.export_stats.total_sections}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Completed</strong>
                                <span>${data.export_info.export_stats.completed_sections}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Data Points</strong>
                                <span>${data.export_info.export_stats.data_points_analyzed.toLocaleString()}</span>
                            </div>
                            <div class="stat-summary-item">
                                <strong>Completeness</strong>
                                <span>${data.export_info.export_stats.analysis_completeness}%</span>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                throw new Error(data.error || 'Failed to export analysis');
            }

        } catch (error) {
            console.error('Export analysis error:', error);
            resultsContainer.innerHTML = `<div class="error-message">Failed to export analysis: ${error.message}</div>`;
        }
    }

    async function exportCleanedDataInfo() {
        if (!currentDatasetId || !currentColumn) {
            showError('Please select a dataset and column first.');
            return;
        }

        const resultsContainer = document.getElementById('export-results');
        
        try {
            // Get the comprehensive analysis to understand what needs to be cleaned
            const analysisResponse = await fetch(`/api/column_analysis/export/${currentDatasetId}?column=${encodeURIComponent(currentColumn.name)}&format=json`);
            if (!analysisResponse.ok) throw new Error('Failed to fetch analysis data');
            
            const analysisData = await analysisResponse.json();
            
            // Create cleaned data recommendations based on actual analysis
            const cleaningInfo = {
                column: currentColumn.name,
                dataset_id: currentDatasetId,
                original_rows: analysisData.export_data?.column_analysis?.basic_statistics?.count || 0,
                cleaning_applied: [
                    'Removed null values',
                    'Removed duplicate entries',
                    'Applied recommended transformations based on analysis'
                ],
                analysis_summary: {
                    data_type: analysisData.export_data?.column_analysis?.data_type,
                    quality_score: analysisData.export_data?.column_analysis?.quality_metrics?.completeness || 0,
                    recommendations: analysisData.export_data?.column_analysis?.recommendations || []
                },
                timestamp: new Date().toISOString()
            };
            
            downloadFile(`${currentColumn.name}_cleaned_data_info.json`, JSON.stringify(cleaningInfo, null, 2), 'application/json');
            
            resultsContainer.innerHTML = `
                <div class="analysis-result">
                    <h6>🧹 Cleaned Data Info Exported</h6>
                    <div class="analysis-summary">
                        <p><strong>File:</strong> ${currentColumn.name}_cleaned_data_info.json</p>
                        <p><strong>Original Rows:</strong> ${cleaningInfo.original_rows.toLocaleString()}</p>
                        <span class="status-badge success">Downloaded</span>
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('Export cleaned data error:', error);
            resultsContainer.innerHTML = `<div class="error-message">Failed to export cleaned data info: ${error.message}</div>`;
        }
    }

    // Quick action functions
    async function quickTransform() {
        document.querySelector('[data-tab="transformation"]').click();
        await runTransformationAnalysis();
    }

    async function quickClean() {
        document.querySelector('[data-tab="transformation"]').click();
        await runCleaningAnalysis();
    }

    async function quickExport() {
        document.querySelector('[data-tab="transformation"]').click();
        await exportAnalysisData();
    }

    // Helper functions
    function convertToCSV(data) {
        // Simple CSV conversion for analysis data
        let csv = 'Property,Value\n';
        
        function addObjectToCSV(obj, prefix = '') {
            for (const [key, value] of Object.entries(obj)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    addObjectToCSV(value, fullKey);
                } else if (Array.isArray(value)) {
                    csv += `"${fullKey}","${value.join('; ')}"\n`;
                } else {
                    csv += `"${fullKey}","${value}"\n`;
                }
            }
        }
        
        addObjectToCSV(data);
        return csv;
    }

    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

// Global function to download cleaned data
window.downloadCleanedData = async function(columnName, datasetId) {
    try {
        showLoading();
        
        // Get the comprehensive analysis to understand what needs to be cleaned
        const analysisResponse = await fetch(`/api/column_analysis/export/${datasetId}?column=${encodeURIComponent(columnName)}&format=json`);
        if (!analysisResponse.ok) throw new Error('Failed to fetch analysis data');
        
        const analysisData = await analysisResponse.json();
        
        // Create cleaned data recommendations based on actual analysis
        const cleaningInfo = {
            column: columnName,
            dataset_id: datasetId,
            original_rows: analysisData.export_data?.column_analysis?.basic_statistics?.count || 0,
            cleaning_applied: [
                'Removed null values',
                'Removed duplicate entries',
                'Applied recommended transformations based on analysis'
            ],
            analysis_summary: {
                data_type: analysisData.export_data?.column_analysis?.data_type,
                quality_score: analysisData.export_data?.column_analysis?.quality_metrics?.completeness || 0,
                recommendations: analysisData.export_data?.column_analysis?.recommendations || []
            },
            timestamp: new Date().toISOString()
        };
        
        downloadJsonData(`${columnName}_cleaned_data_info.json`, cleaningInfo);
        
        showMessage('Success', 'success', 'Cleaned data information downloaded. This contains the cleaning recommendations based on the actual data analysis.');
        
    } catch (error) {
        console.error('Cleaned data export error:', error);
        showError('Failed to export cleaned data: ' + error.message);
    } finally {
        hideLoading();
    }
};

function safeFormat(value, decimals = 3) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }
    return typeof value === 'number' ? value.toFixed(decimals) : String(value);
}