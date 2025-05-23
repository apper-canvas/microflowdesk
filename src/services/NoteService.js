class NoteService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'note1';
    // All fields for note1 table
    this.allFields = ['Name', 'Tags', 'Owner', 'CreatedOn', 'CreatedBy', 'ModifiedOn', 'ModifiedBy', 'title', 'content', 'workspaceId', 'ownerId'];
    // Only updateable fields for create/update operations
    this.updateableFields = ['Name', 'Tags', 'Owner', 'title', 'content', 'workspaceId', 'ownerId'];
  }

  async fetchNotes(filters = {}) {
    try {
      const params = {
        fields: this.allFields,
        orderBy: [
          {
            fieldName: "ModifiedOn",
            SortType: "DESC"
          }
        ]
      };

      // Add filters if provided
      if (filters.where && filters.where.length > 0) {
        params.where = filters.where;
      }

      if (filters.limit) {
        params.pagingInfo = {
          limit: filters.limit,
          offset: filters.offset || 0
        };
      }

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response || !response.data || response.data.length === 0) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching notes:", error);
      throw error;
    }
  }

  async getNoteById(noteId) {
    try {
      const params = {
        fields: this.allFields
      };

      const response = await this.apperClient.getRecordById(this.tableName, noteId, params);
      
      if (!response || !response.data) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching note with ID ${noteId}:`, error);
      throw error;
    }
  }

  async createNotes(notes) {
    try {
      // Filter data to only include updateable fields
      const filteredNotes = notes.map(note => {
        const filteredNote = {};
        this.updateableFields.forEach(field => {
          if (note[field] !== undefined) {
            // Handle data type formatting
            if (field === 'Tags' && Array.isArray(note[field])) {
              filteredNote[field] = note[field].join(',');
            } else {
              filteredNote[field] = note[field];
            }
          }
        });
        return filteredNote;
      });

      const params = {
        records: filteredNotes
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        console.log(`Created ${successfulRecords.length} notes successfully`);
        if (failedRecords.length > 0) {
          console.warn(`Failed to create ${failedRecords.length} notes`);
          failedRecords.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                console.error(`Field: ${error.fieldLabel}, Error: ${error.message}`);
              });
            } else if (record.message) {
              console.error(`Error: ${record.message}`);
            }
          });
        }
        
        return successfulRecords.map(result => result.data);
      } else {
        console.error("Bulk note creation failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error creating notes:", error);
      throw error;
    }
  }

  async updateNotes(notes) {
    try {
      // Filter data to only include updateable fields (plus Id)
      const filteredNotes = notes.map(note => {
        const filteredNote = { Id: note.Id };
        this.updateableFields.forEach(field => {
          if (note[field] !== undefined) {
            // Handle data type formatting
            if (field === 'Tags' && Array.isArray(note[field])) {
              filteredNote[field] = note[field].join(',');
            } else {
              filteredNote[field] = note[field];
            }
          }
        });
        return filteredNote;
      });

      const params = {
        records: filteredNotes
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        console.log(`Updated ${successfulUpdates.length} notes successfully`);
        if (failedUpdates.length > 0) {
          console.warn(`Failed to update ${failedUpdates.length} notes`);
          failedUpdates.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return successfulUpdates.map(result => result.data);
      } else {
        console.error("Bulk note update failed:", response);
        return [];
      }
    } catch (error) {
      console.error("Error updating notes:", error);
      throw error;
    }
  }

  async deleteNotes(noteIds) {
    try {
      const params = {
        RecordIds: noteIds
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (response && response.success && response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        console.log(`Deleted ${successfulDeletions.length} notes successfully`);
        if (failedDeletions.length > 0) {
          console.warn(`Failed to delete ${failedDeletions.length} notes`);
          failedDeletions.forEach(record => {
            console.error(`Error: ${record.message || "Record does not exist"}`);
          });
        }
        
        return true;
      } else {
        console.error("Bulk note deletion failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Error deleting notes:", error);
      throw error;
    }
  }

  async searchNotes(query) {
    try {
      const filters = {
        where: [
          {
            fieldName: "title",
            operator: "Contains",
            values: [query]
          }
        ]
      };
      return await this.fetchNotes(filters);
    } catch (error) {
      console.error("Error searching notes:", error);
      throw error;
    }
  }
}

export default new NoteService();